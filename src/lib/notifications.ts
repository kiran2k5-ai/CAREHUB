import { DatabaseService } from './database';

// Simple email service that gracefully handles missing dependencies
class EmailService {
  private static async getTransporter() {
    try {
      // Only attempt to load nodemailer if we're on server-side and have config
      if (typeof window !== 'undefined' || !process.env.SMTP_HOST) {
        return null;
      }

      const nodemailer = await import('nodemailer');
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } catch (error) {
      console.warn('Email service not available:', error);
      return null;
    }
  }

  static async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      const transporter = await this.getTransporter();
      if (!transporter) {
        console.log('Email service not configured, skipping email to:', to);
        return false;
      }

      await transporter.sendMail({
        from: process.env.SMTP_USER || 'noreply@carehub.com',
        to,
        subject,
        html,
      });

      console.log('Email sent successfully to:', to);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }
}

// Simple SMS service that gracefully handles missing dependencies
class SMSService {
  private static async getClient() {
    try {
      if (typeof window !== 'undefined' || !process.env.TWILIO_ACCOUNT_SID) {
        return null;
      }

      const twilio = await import('twilio');
      return twilio.default(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    } catch (error) {
      console.warn('SMS service not available:', error);
      return null;
    }
  }

  static async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      const client = await this.getClient();
      if (!client || !process.env.TWILIO_PHONE_NUMBER) {
        console.log('SMS service not configured, skipping SMS to:', to);
        return false;
      }

      await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to,
      });

      console.log('SMS sent successfully to:', to);
      return true;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return false;
    }
  }
}

export type NotificationType = 
  | 'APPOINTMENT_BOOKING' 
  | 'APPOINTMENT_REMINDER' 
  | 'APPOINTMENT_CANCELLED' 
  | 'APPOINTMENT_RESCHEDULED' 
  | 'GENERAL' 
  | 'SYSTEM';

export interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  metadata?: any;
  email?: string;
  phone?: string;
  sendEmail?: boolean;
  sendSMS?: boolean;
  sendPush?: boolean;
}

export class NotificationService {
  // Create in-app notification
  static async createNotification(data: NotificationData) {
    try {
      const notification = await DatabaseService.createNotification({
        user_id: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
      });

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Send email notification
  static async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    return await EmailService.sendEmail(to, subject, html);
  }

  // Send SMS notification
  static async sendSMS(to: string, message: string): Promise<boolean> {
    return await SMSService.sendSMS(to, message);
  }

  // Send comprehensive notification (in-app + email + SMS)
  static async sendNotification(data: NotificationData) {
    const results = {
      inApp: false,
      email: false,
      sms: false,
    };

    try {
      // Always create in-app notification
      await this.createNotification(data);
      results.inApp = true;

      // Send email if requested and email is provided
      if (data.sendEmail && data.email) {
        const emailContent = this.generateEmailContent(data);
        results.email = await this.sendEmail(
          data.email,
          data.title,
          emailContent.html
        );
      }

      // Send SMS if requested and phone is provided
      if (data.sendSMS && data.phone) {
        const smsContent = this.generateSMSContent(data);
        results.sms = await this.sendSMS(data.phone, smsContent);
      }

      return results;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  // Generate email content based on notification type
  static generateEmailContent(data: NotificationData): { html: string; text: string } {
    const baseTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; color: #22d3ee; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
          .content { color: #333; line-height: 1.6; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #22d3ee; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">CareHub - Doctor Booking</div>
          <div class="content">
            <h2>${data.title}</h2>
            <p>${data.message}</p>
            ${this.getTypeSpecificContent(data)}
          </div>
          <div class="footer">
            <p>This is an automated message from CareHub. Please do not reply to this email.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `${data.title}\n\n${data.message}\n\nThis is an automated message from CareHub.`;

    return {
      html: baseTemplate,
      text: textContent
    };
  }

  // Generate SMS content
  static generateSMSContent(data: NotificationData): string {
    switch (data.type) {
      case 'APPOINTMENT_BOOKING':
        return `CareHub: ${data.title}. ${data.message}`;
      case 'APPOINTMENT_REMINDER':
        return `CareHub Reminder: ${data.message}`;
      case 'APPOINTMENT_CANCELLED':
        return `CareHub: Your appointment has been cancelled. ${data.message}`;
      case 'APPOINTMENT_RESCHEDULED':
        return `CareHub: Your appointment has been rescheduled. ${data.message}`;
      default:
        return `CareHub: ${data.message}`;
    }
  }

  // Get type-specific content for emails
  static getTypeSpecificContent(data: NotificationData): string {
    switch (data.type) {
      case 'APPOINTMENT_BOOKING':
        return `
          <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3>Appointment Details:</h3>
            ${data.metadata ? this.formatAppointmentDetails(data.metadata) : ''}
          </div>
          <a href="${process.env.NEXTAUTH_URL}/patient-dashboard/appointments" class="button">View Appointment</a>
        `;
      case 'APPOINTMENT_REMINDER':
        return `
          <div style="background-color: #fffbeb; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3>Upcoming Appointment:</h3>
            ${data.metadata ? this.formatAppointmentDetails(data.metadata) : ''}
          </div>
          <a href="${process.env.NEXTAUTH_URL}/patient-dashboard/appointments" class="button">View Details</a>
        `;
      case 'APPOINTMENT_CANCELLED':
        return `
          <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p>If you have any questions about this cancellation, please contact our support team.</p>
          </div>
          <a href="${process.env.NEXTAUTH_URL}/doctors" class="button">Book Another Appointment</a>
        `;
      default:
        return '';
    }
  }

  // Format appointment details for email
  static formatAppointmentDetails(metadata: any): string {
    if (!metadata) return '';
    
    return `
      <p><strong>Doctor:</strong> ${metadata.doctorName || 'N/A'}</p>
      <p><strong>Date:</strong> ${metadata.date || 'N/A'}</p>
      <p><strong>Time:</strong> ${metadata.time || 'N/A'}</p>
      <p><strong>Type:</strong> ${metadata.consultationType || 'N/A'}</p>
      <p><strong>Fee:</strong> ₹${metadata.consultationFee || 'N/A'}</p>
    `;
  }

  // Send appointment booking notification
  static async sendAppointmentBookingNotification(
    patientId: string,
    doctorId: string,
    appointmentData: any,
    userDetails: { email?: string; phone?: string }
  ) {
    const notificationData: NotificationData = {
      userId: patientId,
      title: 'Appointment Booked Successfully',
      message: `Your appointment with Dr. ${appointmentData.doctorName} has been confirmed for ${appointmentData.date} at ${appointmentData.time}.`,
      type: 'APPOINTMENT_BOOKING',
      metadata: appointmentData,
      email: userDetails.email,
      phone: userDetails.phone,
      sendEmail: true,
      sendSMS: true,
    };

    await this.sendNotification(notificationData);

    // Also notify the doctor
    const doctorNotificationData: NotificationData = {
      userId: doctorId,
      title: 'New Appointment Booking',
      message: `You have a new appointment booking from ${appointmentData.patientName} for ${appointmentData.date} at ${appointmentData.time}.`,
      type: 'APPOINTMENT_BOOKING',
      metadata: appointmentData,
      sendEmail: false,
      sendSMS: false,
    };

    await this.sendNotification(doctorNotificationData);
  }

  // Send appointment reminder notification
  static async sendAppointmentReminder(
    userId: string,
    appointmentData: any,
    userDetails: { email?: string; phone?: string }
  ) {
    const notificationData: NotificationData = {
      userId,
      title: 'Appointment Reminder',
      message: `Reminder: You have an appointment with Dr. ${appointmentData.doctorName} tomorrow at ${appointmentData.time}.`,
      type: 'APPOINTMENT_REMINDER',
      metadata: appointmentData,
      email: userDetails.email,
      phone: userDetails.phone,
      sendEmail: true,
      sendSMS: true,
    };

    await this.sendNotification(notificationData);
  }

  // Send appointment cancellation notification
  static async sendAppointmentCancellationNotification(
    userId: string,
    appointmentData: any,
    userDetails: { email?: string; phone?: string },
    reason?: string
  ) {
    const notificationData: NotificationData = {
      userId,
      title: 'Appointment Cancelled',
      message: `Your appointment with Dr. ${appointmentData.doctorName} scheduled for ${appointmentData.date} at ${appointmentData.time} has been cancelled.${reason ? ` Reason: ${reason}` : ''}`,
      type: 'APPOINTMENT_CANCELLED',
      metadata: appointmentData,
      email: userDetails.email,
      phone: userDetails.phone,
      sendEmail: true,
      sendSMS: true,
    };

    await this.sendNotification(notificationData);
  }

  // Get user notifications
  static async getUserNotifications(userId: string, unreadOnly = false) {
    return await DatabaseService.getNotificationsByUserId(userId, unreadOnly);
  }

  // Mark notification as read
  static async markAsRead(notificationId: string) {
    return await DatabaseService.markNotificationAsRead(notificationId);
  }

  // Mark all notifications as read
  static async markAllAsRead(userId: string) {
    return await DatabaseService.markAllNotificationsAsRead(userId);
  }
}