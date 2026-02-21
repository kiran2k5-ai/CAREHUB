// Patient notifications API
import { NextRequest, NextResponse } from 'next/server';

// Mock notifications data for patients
let mockPatientNotifications = [
  {
    id: '1',
    patientId: 'patient_9042222856',
    type: 'appointment',
    title: 'Appointment Confirmed',
    message: 'Your appointment with Dr. Prakash Das has been confirmed for today at 10:00 AM',
    time: '30 minutes ago',
    read: false,
    appointmentId: 'apt-patient-001'
  },
  {
    id: '2',
    patientId: 'patient_9042222856',
    type: 'reminder',
    title: 'Upcoming Appointment',
    message: 'Reminder: You have an appointment tomorrow at 2:30 PM with Dr. Sarah Wilson',
    time: '2 hours ago',
    read: true
  },
  {
    id: '3',
    patientId: 'patient_9042222856',
    type: 'update',
    title: 'Health Report Ready',
    message: 'Your latest health report is now available in your medical records',
    time: '1 day ago',
    read: false
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    
    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }
    
    // Filter notifications for the specific patient
    const patientNotifications = mockPatientNotifications.filter(
      notification => notification.patientId === patientId
    );
    
    console.log(`📧 Found ${patientNotifications.length} notifications for patient: ${patientId}`);
    
    return NextResponse.json({
      success: true,
      data: patientNotifications,
      count: patientNotifications.length
    });
    
  } catch (error) {
    console.error('Error fetching patient notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// Mark notification as read
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, patientId } = body;
    
    if (action === 'mark_read' && id) {
      // Mark specific notification as read
      const notification = mockPatientNotifications.find(n => n.id === id);
      if (notification) {
        notification.read = true;
        console.log(`✅ Marked notification ${id} as read`);
      }
    } else if (action === 'mark_all_read' && patientId) {
      // Mark all notifications as read for the patient
      mockPatientNotifications.forEach(notification => {
        if (notification.patientId === patientId) {
          notification.read = true;
        }
      });
      console.log(`✅ Marked all notifications as read for patient: ${patientId}`);
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

// Delete notification
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }
    
    const index = mockPatientNotifications.findIndex(n => n.id === id);
    if (index > -1) {
      mockPatientNotifications.splice(index, 1);
      console.log(`🗑️ Deleted notification: ${id}`);
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}

// Add new notification (for when appointments are booked, etc.)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, type, title, message } = body;
    
    if (!patientId || !title || !message) {
      return NextResponse.json(
        { error: 'Patient ID, title, and message are required' },
        { status: 400 }
      );
    }
    
    const newNotification = {
      id: `notif-${Date.now()}`,
      patientId,
      type: type || 'general',
      title,
      message,
      time: 'Just now',
      read: false
    };
    
    mockPatientNotifications.unshift(newNotification);
    console.log(`📧 Added new notification for patient: ${patientId}`);
    
    return NextResponse.json({
      success: true,
      data: newNotification
    });
    
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}