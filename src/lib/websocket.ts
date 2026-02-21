import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { DatabaseService } from './database';
import { NotificationService } from './notifications';

export interface ServerToClientEvents {
  'notification': (notification: any) => void;
  'appointment_created': (appointment: any) => void;
  'appointment_updated': (appointment: any) => void;
  'appointment_cancelled': (appointment: any) => void;
  'doctor_status_changed': (data: { doctorId: string; isAvailable: boolean }) => void;
  'time_slot_updated': (data: { doctorId: string; date: string; time: string; available: boolean }) => void;
}

export interface ClientToServerEvents {
  'join_user_room': (userId: string) => void;
  'join_doctor_room': (doctorId: string) => void;
  'leave_room': (roomId: string) => void;
  'mark_notification_read': (notificationId: string) => void;
  'get_unread_count': (userId: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId?: string;
  userType?: 'PATIENT' | 'DOCTOR';
}

export class WebSocketService {
  private io: SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >;

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Join user-specific room
      socket.on('join_user_room', async (userId) => {
        try {
          socket.data.userId = userId;
          await socket.join(`user:${userId}`);
          console.log(`User ${userId} joined room user:${userId}`);

          // Send unread notification count
          const unreadNotifications = await DatabaseService.getNotificationsByUserId(userId, true);
          socket.emit('notification', {
            type: 'unread_count',
            count: unreadNotifications?.length || 0
          });
        } catch (error) {
          console.error('Error joining user room:', error);
        }
      });

      // Join doctor-specific room
      socket.on('join_doctor_room', async (doctorId) => {
        try {
          await socket.join(`doctor:${doctorId}`);
          console.log(`Doctor ${doctorId} joined room doctor:${doctorId}`);
        } catch (error) {
          console.error('Error joining doctor room:', error);
        }
      });

      // Leave room
      socket.on('leave_room', async (roomId) => {
        try {
          await socket.leave(roomId);
          console.log(`Socket ${socket.id} left room ${roomId}`);
        } catch (error) {
          console.error('Error leaving room:', error);
        }
      });

      // Mark notification as read
      socket.on('mark_notification_read', async (notificationId) => {
        try {
          await DatabaseService.markNotificationAsRead(notificationId);
          
          if (socket.data.userId) {
            const unreadNotifications = await DatabaseService.getNotificationsByUserId(socket.data.userId, true);
            socket.emit('notification', {
              type: 'unread_count',
              count: unreadNotifications?.length || 0
            });
          }
        } catch (error) {
          console.error('Error marking notification as read:', error);
        }
      });

      // Get unread notification count
      socket.on('get_unread_count', async (userId) => {
        try {
          const unreadNotifications = await DatabaseService.getNotificationsByUserId(userId, true);
          socket.emit('notification', {
            type: 'unread_count',
            count: unreadNotifications?.length || 0
          });
        } catch (error) {
          console.error('Error getting unread count:', error);
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  // Send notification to specific user
  async sendNotificationToUser(userId: string, notification: any) {
    this.io.to(`user:${userId}`).emit('notification', notification);
  }

  // Send appointment update to patient and doctor
  async sendAppointmentUpdate(appointmentData: any, type: 'created' | 'updated' | 'cancelled') {
    const { patient_id, doctor_id } = appointmentData;

    // Send to patient
    this.io.to(`user:${patient_id}`).emit(`appointment_${type}`, appointmentData);
    
    // Send to doctor
    this.io.to(`user:${doctor_id}`).emit(`appointment_${type}`, appointmentData);
    this.io.to(`doctor:${doctor_id}`).emit(`appointment_${type}`, appointmentData);
  }

  // Notify about doctor availability change
  async sendDoctorStatusChange(doctorId: string, isAvailable: boolean) {
    this.io.emit('doctor_status_changed', { doctorId, isAvailable });
  }

  // Notify about time slot updates
  async sendTimeSlotUpdate(doctorId: string, date: string, time: string, available: boolean) {
    this.io.emit('time_slot_updated', { doctorId, date, time, available });
  }

  // Broadcast system notification to all users
  async broadcastSystemNotification(notification: any) {
    this.io.emit('notification', {
      type: 'system',
      ...notification
    });
  }

  // Send notification to all doctors
  async sendNotificationToDoctors(notification: any) {
    // Get all connected doctor sockets
    const doctorRooms = Array.from(this.io.sockets.adapter.rooms.keys())
      .filter(room => room.startsWith('doctor:'));
    
    doctorRooms.forEach(room => {
      this.io.to(room).emit('notification', notification);
    });
  }

  // Get server instance
  getIO() {
    return this.io;
  }
}

// Singleton instance
let webSocketService: WebSocketService | null = null;

export function initializeWebSocketService(server: HTTPServer): WebSocketService {
  if (!webSocketService) {
    webSocketService = new WebSocketService(server);
  }
  return webSocketService;
}

export function getWebSocketService(): WebSocketService | null {
  return webSocketService;
}

// Helper functions for easy access
export async function notifyUser(userId: string, notification: any) {
  if (webSocketService) {
    await webSocketService.sendNotificationToUser(userId, notification);
  }
}

export async function notifyAppointmentUpdate(appointmentData: any, type: 'created' | 'updated' | 'cancelled') {
  if (webSocketService) {
    await webSocketService.sendAppointmentUpdate(appointmentData, type);
  }
}

export async function notifyDoctorStatusChange(doctorId: string, isAvailable: boolean) {
  if (webSocketService) {
    await webSocketService.sendDoctorStatusChange(doctorId, isAvailable);
  }
}

export async function notifyTimeSlotUpdate(doctorId: string, date: string, time: string, available: boolean) {
  if (webSocketService) {
    await webSocketService.sendTimeSlotUpdate(doctorId, date, time, available);
  }
}