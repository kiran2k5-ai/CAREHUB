import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { NotificationService } from '@/lib/notifications';
import { CreateNotificationSchema, validateData } from '@/lib/validations';

// GET /api/notifications - Get notifications for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const notifications = await DatabaseService.getNotificationsByUserId(userId, unreadOnly);

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNotifications = notifications?.slice(startIndex, endIndex) || [];

    // Transform data for frontend
    const transformedNotifications = paginatedNotifications.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.is_read,
      metadata: notification.metadata ? JSON.parse(notification.metadata) : null,
      createdAt: notification.created_at,
      updatedAt: notification.updated_at
    }));

    return NextResponse.json({
      success: true,
      data: transformedNotifications,
      pagination: {
        page,
        limit,
        total: notifications?.length || 0,
        totalPages: Math.ceil((notifications?.length || 0) / limit),
        hasNext: endIndex < (notifications?.length || 0),
        hasPrev: page > 1
      },
      unreadCount: notifications?.filter(n => !n.is_read).length || 0
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const notificationData = await request.json();

    // Validate notification data
    const validation = validateData(CreateNotificationSchema, {
      user_id: notificationData.userId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || 'GENERAL',
      metadata: notificationData.metadata ? JSON.stringify(notificationData.metadata) : undefined
    });

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        errors: validation.errors
      }, { status: 400 });
    }

    // Create notification
    const notification = await DatabaseService.createNotification(validation.data!);

    // If this is a comprehensive notification request, send via multiple channels
    if (notificationData.sendEmail || notificationData.sendSMS) {
      const user = await DatabaseService.getUserById(notificationData.userId);
      
      await NotificationService.sendNotification({
        userId: notificationData.userId,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type || 'GENERAL',
        metadata: notificationData.metadata,
        email: user?.email || undefined,
        phone: user?.phone || undefined,
        sendEmail: notificationData.sendEmail || false,
        sendSMS: notificationData.sendSMS || false
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        isRead: notification.is_read,
        metadata: notification.metadata ? JSON.parse(notification.metadata) : null,
        createdAt: notification.created_at
      },
      message: 'Notification created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications - Mark notification(s) as read
export async function PATCH(request: NextRequest) {
  try {
    const { notificationId, userId, markAll } = await request.json();

    if (markAll && userId) {
      // Mark all notifications as read for the user
      await DatabaseService.markAllNotificationsAsRead(userId);
      
      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } else if (notificationId) {
      // Mark specific notification as read
      const notification = await DatabaseService.markNotificationAsRead(notificationId);
      
      return NextResponse.json({
        success: true,
        data: {
          id: notification.id,
          isRead: notification.is_read,
          updatedAt: notification.updated_at
        },
        message: 'Notification marked as read'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Either notificationId or userId with markAll=true is required' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}