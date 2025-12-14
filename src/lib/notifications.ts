import { prisma } from "./prisma";

interface CreateNotificationParams {
  userId: string;
  type: "EVENT_REMINDER" | "TASK_DEADLINE" | "VOTE_CREATED" | "GROUP_ASSIGNED" | "WORKSPACE_INVITE" | "GENERAL";
  title: string;
  message: string;
  referenceId?: string;
  channels?: ("EMAIL" | "SMS" | "PUSH")[];
  scheduledFor?: Date;
}

/**
 * Create a notification for a user
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  referenceId,
  channels = ["PUSH"],
  scheduledFor
}: CreateNotificationParams) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      referenceId,
      channels,
      scheduledFor
    }
  });
}

/**
 * Create notifications for multiple users
 */
export async function createBulkNotifications(
  userIds: string[],
  params: Omit<CreateNotificationParams, "userId">
) {
  return prisma.notification.createMany({
    data: userIds.map(userId => ({
      userId,
      type: params.type,
      title: params.title,
      message: params.message,
      referenceId: params.referenceId,
      channels: params.channels || ["PUSH"],
      scheduledFor: params.scheduledFor
    }))
  });
}

/**
 * Create task deadline reminders for all workspace members
 */
export async function createTaskReminders(taskId: string, workspaceId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { discipline: true }
  });
  
  if (!task) return;
  
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    select: { userId: true }
  });
  
  const userIds = members.map(m => m.userId);
  
  // Create reminder for day before
  const dayBefore = new Date(task.dueDate);
  dayBefore.setDate(dayBefore.getDate() - 1);
  
  if (dayBefore > new Date()) {
    await createBulkNotifications(userIds, {
      type: "TASK_DEADLINE",
      title: `Lembrete: ${task.title}`,
      message: `A tarefa "${task.title}" tem prazo amanhã!`,
      referenceId: taskId,
      scheduledFor: dayBefore
    });
  }
  
  // Create reminder for the day
  const onDay = new Date(task.dueDate);
  onDay.setHours(9, 0, 0, 0); // 9 AM on due date
  
  if (onDay > new Date()) {
    await createBulkNotifications(userIds, {
      type: "TASK_DEADLINE",
      title: `Prazo hoje: ${task.title}`,
      message: `A tarefa "${task.title}" vence hoje!`,
      referenceId: taskId,
      scheduledFor: onDay
    });
  }
}

/**
 * Create event reminders for all workspace members
 */
export async function createEventReminders(eventId: string, workspaceId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });
  
  if (!event) return;
  
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    select: { userId: true }
  });
  
  const userIds = members.map(m => m.userId);
  
  // Create reminder for day before
  const dayBefore = new Date(event.startDate);
  dayBefore.setDate(dayBefore.getDate() - 1);
  
  if (dayBefore > new Date()) {
    await createBulkNotifications(userIds, {
      type: "EVENT_REMINDER",
      title: `Evento amanhã: ${event.title}`,
      message: event.location 
        ? `O evento "${event.title}" acontece amanhã em ${event.location}`
        : `O evento "${event.title}" acontece amanhã`,
      referenceId: eventId,
      scheduledFor: dayBefore
    });
  }
  
  // Create reminder for the day (2 hours before)
  const twoHoursBefore = new Date(event.startDate);
  twoHoursBefore.setHours(twoHoursBefore.getHours() - 2);
  
  if (twoHoursBefore > new Date()) {
    await createBulkNotifications(userIds, {
      type: "EVENT_REMINDER",
      title: `Em breve: ${event.title}`,
      message: `O evento "${event.title}" começa em 2 horas!`,
      referenceId: eventId,
      scheduledFor: twoHoursBefore
    });
  }
}

/**
 * Send notification (placeholder for email/SMS integration)
 * TODO: Integrate with actual email/SMS providers
 */
export async function sendNotification(notificationId: string) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    include: {
      user: { select: { email: true, phone: true } }
    }
  });
  
  if (!notification) return;
  
  // Get user preferences
  const preferences = await prisma.notificationPreference.findUnique({
    where: { userId: notification.userId }
  });
  
  const channels = notification.channels;
  
  // Email notification
  if (channels.includes("EMAIL") && preferences?.emailEnabled && notification.user.email) {
    // TODO: Integrate with email provider (SendGrid, Resend, etc.)
    console.log(`[EMAIL] To: ${notification.user.email}, Subject: ${notification.title}`);
  }
  
  // SMS notification
  if (channels.includes("SMS") && preferences?.smsEnabled && notification.user.phone) {
    // TODO: Integrate with SMS provider (Twilio, etc.)
    console.log(`[SMS] To: ${notification.user.phone}, Message: ${notification.message}`);
  }
  
  // Mark as sent
  await prisma.notification.update({
    where: { id: notificationId },
    data: { sentAt: new Date() }
  });
}
