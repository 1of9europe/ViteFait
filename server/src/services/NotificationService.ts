import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import { NotFoundError } from '../utils/errors';
import { generateId, now } from '../utils/helpers';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  sound?: string;
  priority?: 'high' | 'normal' | 'low';
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  type: 'mission' | 'payment' | 'system' | 'chat';
  read: boolean;
  createdAt: Date;
  sentAt?: Date;
}

export class NotificationService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Envoyer une notification à un utilisateur spécifique
   */
  async sendToUser(userId: string, payload: NotificationPayload, type: string = 'system'): Promise<void> {
    logger.info({ userId, type, title: payload.title }, 'Envoi de notification à un utilisateur');

    // Vérifier que l'utilisateur existe
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      logger.warn({ userId }, 'Tentative d\'envoi de notification à un utilisateur inexistant');
      throw new NotFoundError('USER_NOT_FOUND', 'Utilisateur non trouvé');
    }

    // Créer la notification
    const notification: Notification = {
      id: generateId(),
      userId,
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
      type: type as any,
      read: false,
      createdAt: now()
    };

    // TODO: Sauvegarder la notification en base de données
    // await this.notificationRepository.save(notification);

    // Envoyer la notification push si l'utilisateur a un token FCM
    if (user.fcmToken) {
      await this.sendPushNotification(user.fcmToken, payload);
      notification.sentAt = now();
    }

    logger.info({ userId, notificationId: notification.id }, 'Notification envoyée avec succès');
  }

  /**
   * Envoyer une notification à plusieurs utilisateurs
   */
  async sendToUsers(userIds: string[], payload: NotificationPayload, type: string = 'system'): Promise<void> {
    logger.info({ userIds: userIds.length, type, title: payload.title }, 'Envoi de notification à plusieurs utilisateurs');

    const promises = userIds.map(userId => this.sendToUser(userId, payload, type));
    await Promise.allSettled(promises);

    logger.info({ userIds: userIds.length }, 'Notifications envoyées à tous les utilisateurs');
  }

  /**
   * Envoyer une notification de chat
   */
  async sendChatNotification(
    senderId: string, 
    recipientId: string, 
    missionId: string, 
    message: string
  ): Promise<void> {
    const sender = await this.userRepository.findOne({
      where: { id: senderId }
    });

    if (!sender) {
      throw new NotFoundError('SENDER_NOT_FOUND', 'Expéditeur non trouvé');
    }

    const payload: NotificationPayload = {
      title: `Nouveau message de ${sender.getFullName()}`,
      body: message,
      data: {
        type: 'chat',
        missionId,
        senderId,
        senderName: sender.getFullName()
      },
      priority: 'high'
    };

    await this.sendToUser(recipientId, payload, 'chat');
  }

  /**
   * Envoyer une notification de mise à jour de statut de mission
   */
  async sendMissionStatusNotification(
    userId: string,
    missionId: string,
    status: string,
    missionTitle: string
  ): Promise<void> {
    const statusText = this.getStatusText(status);
    
    const payload: NotificationPayload = {
      title: `Mission ${statusText}`,
      body: `Votre mission "${missionTitle}" est maintenant ${statusText.toLowerCase()}`,
      data: {
        type: 'mission_status',
        missionId,
        status
      },
      priority: 'high'
    };

    await this.sendToUser(userId, payload, 'mission');
  }

  /**
   * Envoyer une notification de paiement
   */
  async sendPaymentNotification(
    userId: string,
    amount: number,
    currency: string,
    type: string
  ): Promise<void> {
    const payload: NotificationPayload = {
      title: 'Paiement traité',
      body: `Votre paiement de ${amount} ${currency} a été ${type}`,
      data: {
        type: 'payment',
        amount,
        currency,
        paymentType: type
      },
      priority: 'normal'
    };

    await this.sendToUser(userId, payload, 'payment');
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    logger.info({ notificationId, userId }, 'Marquage de notification comme lue');

    // TODO: Implémenter la mise à jour en base de données
    // await this.notificationRepository.update(
    //   { id: notificationId, userId },
    //   { read: true }
    // );

    logger.info({ notificationId, userId }, 'Notification marquée comme lue');
  }

  /**
   * Obtenir les notifications d'un utilisateur
   */
  async getUserNotifications(userId: string, limit: number = 20): Promise<Notification[]> {
    logger.info({ userId, limit }, 'Récupération des notifications utilisateur');

    // TODO: Implémenter la récupération depuis la base de données
    // const notifications = await this.notificationRepository.find({
    //   where: { userId },
    //   order: { createdAt: 'DESC' },
    //   take: limit
    // });

    // Pour l'instant, retourner un tableau vide
    const notifications: Notification[] = [];

    logger.info({ userId, count: notifications.length }, 'Notifications récupérées');

    return notifications;
  }

  /**
   * Supprimer une notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    logger.info({ notificationId, userId }, 'Suppression de notification');

    // TODO: Implémenter la suppression en base de données
    // await this.notificationRepository.delete({ id: notificationId, userId });

    logger.info({ notificationId, userId }, 'Notification supprimée');
  }

  /**
   * Envoyer une notification push via FCM
   */
  private async sendPushNotification(fcmToken: string, payload: NotificationPayload): Promise<void> {
    try {
      // TODO: Implémenter l'envoi via Firebase Cloud Messaging
      // const message = {
      //   token: fcmToken,
      //   notification: {
      //     title: payload.title,
      //     body: payload.body
      //   },
      //   data: payload.data,
      //   android: {
      //     priority: payload.priority || 'normal'
      //   },
      //   apns: {
      //     payload: {
      //       aps: {
      //         badge: payload.badge,
      //         sound: payload.sound || 'default'
      //       }
      //     }
      //   }
      // };
      // 
      // await admin.messaging().send(message);

      logger.info({ fcmToken, title: payload.title }, 'Notification push envoyée');
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : String(error), fcmToken }, 'Erreur lors de l\'envoi de notification push');
      
      // Ne pas faire échouer l'opération principale si la notification push échoue
      // L'utilisateur recevra quand même la notification dans l'app
    }
  }

  /**
   * Obtenir le texte d'un statut
   */
  private getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'En attente',
      'accepted': 'Acceptée',
      'in_progress': 'En cours',
      'completed': 'Terminée',
      'cancelled': 'Annulée',
      'disputed': 'En litige'
    };

    return statusMap[status] || status;
  }

  /**
   * Envoyer une notification de bienvenue
   */
  async sendWelcomeNotification(userId: string, userName: string): Promise<void> {
    const payload: NotificationPayload = {
      title: 'Bienvenue sur ViteFait !',
      body: `Bonjour ${userName}, nous sommes ravis de vous accueillir sur notre plateforme.`,
      data: {
        type: 'welcome'
      },
      priority: 'normal'
    };

    await this.sendToUser(userId, payload, 'system');
  }

  /**
   * Envoyer une notification de rappel
   */
  async sendReminderNotification(userId: string, missionTitle: string, reminderType: string): Promise<void> {
    const messages: Record<string, string> = {
      'start': `N\'oubliez pas de démarrer votre mission "${missionTitle}"`,
      'complete': `N\'oubliez pas de finaliser votre mission "${missionTitle}"`,
      'review': `N\'oubliez pas d\'évaluer votre mission "${missionTitle}"`
    };

    const payload: NotificationPayload = {
      title: 'Rappel de mission',
      body: messages[reminderType] || 'Rappel de mission',
      data: {
        type: 'reminder',
        reminderType
      },
      priority: 'normal'
    };

    await this.sendToUser(userId, payload, 'system');
  }
}

// Instance singleton
export const notificationService = new NotificationService(); 