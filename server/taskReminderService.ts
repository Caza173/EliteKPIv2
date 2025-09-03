import { storage } from './storage';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export class TaskReminderService {
  private checkInterval: NodeJS.Timeout | null = null;

  start() {
    // Check for due tasks every minute
    this.checkInterval = setInterval(() => {
      this.checkDueTasks();
    }, 60 * 1000); // 60 seconds
    
    console.log('Task reminder service started');
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    console.log('Task reminder service stopped');
  }

  private async checkDueTasks() {
    try {
      // Check for tasks due in 30 minutes
      const tasks30min = await storage.getTasksDueInMinutes(30);
      for (const task of tasks30min) {
        await this.sendTaskReminder(task, '30min');
        await storage.markTaskReminder30minSent(task.id);
      }

      // Check for tasks due in 10 minutes
      const tasks10min = await storage.getTasksDueInMinutes(10);
      for (const task of tasks10min) {
        await this.sendTaskReminder(task, '10min');
        await storage.markTaskReminder10minSent(task.id);
      }

      // Check for tasks due in 5 minutes
      const tasks5min = await storage.getTasksDueInMinutes(5);
      for (const task of tasks5min) {
        await this.sendTaskReminder(task, '5min');
        await storage.markTaskReminder5minSent(task.id);
      }

      // Check for tasks that are now due
      const dueTasks = await storage.getDueTasks();
      for (const task of dueTasks) {
        await this.sendTaskReminder(task, 'due');
        await storage.markTaskReminderDueSent(task.id);
      }

      // Check for tasks that are 5 minutes overdue
      const overdueTasks = await storage.getOverdueTasks();
      for (const task of overdueTasks) {
        await this.sendTaskReminder(task, '5min-overdue');
        await storage.markTaskReminder5minOverdueSent(task.id);
      }
    } catch (error) {
      console.error('Error checking due tasks:', error);
    }
  }

  private async sendTaskReminder(task: any, reminderType: '30min' | '10min' | '5min' | 'due' | '5min-overdue') {
    try {
      const user = await storage.getUser(task.userId);
      if (!user) return;

      // Send email notification
      if (user.email && process.env.SENDGRID_API_KEY) {
        try {
          await this.sendEmailReminder(user, task, reminderType);
          console.log(`✅ Email sent successfully for task: ${task.title} to ${user.email}`);
        } catch (emailError) {
          console.error(`❌ Failed to send email for task: ${task.title} to ${user.email}`, emailError);
        }
      } else {
        console.log(`⚠️ Email not sent - Missing email (${user.email}) or SendGrid API key`);
      }

      // Send SMS notification (mock implementation - would need Twilio integration)
      await this.sendSMSReminder(user, task, reminderType);

      // Create in-app notification
      const timeLabel = reminderType === 'due' ? 'now' : 
                       reminderType === '5min-overdue' ? '5 minutes ago and is overdue' :
                       reminderType === '30min' ? 'in 30 minutes' :
                       reminderType === '10min' ? 'in 10 minutes' : 'in 5 minutes';
      
      const notificationTitle = reminderType === 'due' ? '🚨 Task Due Now' : 
                               reminderType === '5min-overdue' ? '⚠️ Task Overdue' : '📅 Task Reminder';
                               
      await storage.createNotification(task.userId, {
        title: notificationTitle,
        message: `Your task "${task.title}" ${reminderType === '5min-overdue' ? 'was due' : 'is due'} ${timeLabel}!`,
        type: 'reminder',
        method: 'in_app',
        sentAt: new Date(),
        scheduledFor: null,
      });

      console.log(`Task ${reminderType} reminder sent for task: ${task.title} to user: ${user.email}`);
    } catch (error) {
      console.error('Error sending task reminder:', error);
    }
  }

  private async sendEmailReminder(user: any, task: any, reminderType: '30min' | '10min' | '5min' | 'due' | '5min-overdue') {
    const dueDate = new Date(task.dueDate).toLocaleDateString();
    const dueTime = new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const reminderLabels = {
      '30min': { title: '⏰ Task Reminder - 30 Minutes', subtitle: 'Your task is due in 30 minutes', bgColor: '#dbeafe', borderColor: '#3b82f6', textColor: '#1e40af' },
      '10min': { title: '⚠️ Task Reminder - 10 Minutes', subtitle: 'Your task is due in 10 minutes', bgColor: '#dbeafe', borderColor: '#3b82f6', textColor: '#1e40af' },
      '5min': { title: '🚨 Urgent Task Reminder - 5 Minutes', subtitle: 'Your task is due in 5 minutes!', bgColor: '#fee2e2', borderColor: '#ef4444', textColor: '#dc2626' },
      'due': { title: '🚨 Task Due Now', subtitle: 'Your task is due now!', bgColor: '#fee2e2', borderColor: '#ef4444', textColor: '#dc2626' },
      '5min-overdue': { title: '⚠️ Task Overdue!', subtitle: 'Your task is now 5 minutes overdue!', bgColor: '#fee2e2', borderColor: '#dc2626', textColor: '#991b1b' }
    };

    const reminderStyle = reminderLabels[reminderType];

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
        <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1; margin: 0; font-size: 28px;">${reminderStyle.title}</h1>
            <p style="color: #6b7280; margin: 5px 0 0 0;">${reminderStyle.subtitle}</p>
          </div>
          
          <div style="background-color: ${reminderStyle.bgColor}; border-left: 4px solid ${reminderStyle.borderColor}; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <h2 style="color: ${reminderStyle.textColor}; margin: 0 0 10px 0; font-size: 20px;">${task.title}</h2>
            <p style="color: ${reminderStyle.textColor}; margin: 0; font-size: 14px;">Due: ${dueDate} at ${dueTime}</p>
          </div>
          
          ${task.description ? `
          <div style="margin: 20px 0;">
            <h3 style="color: #374151; margin: 0 0 10px 0;">Description:</h3>
            <p style="color: #6b7280; margin: 0; line-height: 1.5;">${task.description}</p>
          </div>
          ` : ''}
          
          <div style="margin: 20px 0;">
            <p style="color: #374151; margin: 0 0 10px 0;"><strong>Priority:</strong> 
              <span style="color: ${task.priority === 'high' ? '#dc2626' : task.priority === 'medium' ? '#3b82f6' : '#10b981'}; text-transform: capitalize;">
                ${task.priority} Priority
              </span>
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:5000/smart-tasks" 
               style="display: inline-block; background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 0 10px;">
              Complete Task
            </a>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #9ca3af; font-size: 14px; margin: 0;">
              Stay on top of your real estate goals with EliteKPI
            </p>
          </div>
        </div>
      </div>
    `;

    const msg = {
      to: user.email,
      from: {
        email: 'nhcazateam@gmail.com',
        name: 'EliteKPI Task Reminders'
      },
      subject: reminderType === 'due' ? `🚨 Task Due Now: ${task.title}` :
               reminderType === '5min-overdue' ? `⚠️ Task Overdue: ${task.title}` :
               reminderType === '30min' ? `⏰ Task Due in 30 min: ${task.title}` :
               reminderType === '10min' ? `⚠️ Task Due in 10 min: ${task.title}` :
               `🚨 Task Due in 5 min: ${task.title}`,
      html: emailContent,
      text: `Task Reminder: "${task.title}" is due now!\n\nDue: ${dueDate} at ${dueTime}\n${task.description ? `\nDescription: ${task.description}` : ''}\n\nPriority: ${task.priority}\n\nComplete your task: http://localhost:5000/smart-tasks`
    };

    try {
      await sgMail.send(msg);
      console.log(`📧 SendGrid email sent successfully to ${user.email}`);
    } catch (error) {
      console.error(`🚨 SendGrid error:`, error);
      throw error; // Re-throw to be caught by the calling function
    }
  }

  private async sendSMSReminder(user: any, task: any, reminderType: '30min' | '10min' | '5min' | 'due' | '5min-overdue') {
    // Mock SMS implementation - in production, would integrate with Twilio
    const timeLabel = reminderType === 'due' ? 'now' : 
                     reminderType === '5min-overdue' ? '5 min ago (overdue)' :
                     reminderType === '30min' ? 'in 30 min' :
                     reminderType === '10min' ? 'in 10 min' : 'in 5 min';
    
    const smsLabel = reminderType === 'due' ? 'Due' : 
                    reminderType === '5min-overdue' ? 'Overdue' : 'Reminder';
                    
    const smsMessage = `📅 EliteKPI Task ${smsLabel}: "${task.title}" - Due ${timeLabel}. Complete at http://localhost:5000/smart-tasks`;
    
    console.log(`Mock SMS to ${user.email} (SMS feature): ${smsMessage}`);
    
    // Store SMS notification record (using email as placeholder since no phone field exists)
    await storage.createNotification(user.id, {
      title: `Task ${smsLabel} (SMS)`,
      message: smsMessage,
      type: 'reminder',
      method: 'sms',
      sentAt: new Date(),
      scheduledFor: null,
    });
  }
}

export const taskReminderService = new TaskReminderService();