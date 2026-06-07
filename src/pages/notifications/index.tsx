import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useAppStore';
import { Notification } from '@/types';
import { formatRelativeTime } from '@/utils';

type TabType = 'all' | 'task' | 'mention' | 'system';

const tabList: { key: TabType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'task', label: '任务' },
  { key: 'mention', label: '@我' },
  { key: 'system', label: '系统' }
];

const NotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  
  const notifications = useAppStore(state => state.notifications);
  const markNotificationAsRead = useAppStore(state => state.markNotificationAsRead);
  const markAllNotificationsAsRead = useAppStore(state => state.markAllNotificationsAsRead);

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return notifications;
    if (activeTab === 'mention') {
      return notifications.filter(n => n.type === 'mention' || n.type === 'comment');
    }
    if (activeTab === 'task') {
      return notifications.filter(n => 
        n.type === 'task_assigned' || n.type === 'task_due' || n.type === 'task_overdue'
      );
    }
    if (activeTab === 'system') {
      return notifications.filter(n => n.type === 'meeting_reminder' || n.type === 'file_uploaded');
    }
    return notifications;
  }, [activeTab, notifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  const tabUnreadCounts = useMemo(() => {
    return {
      task: notifications.filter(n => 
        !n.isRead && (n.type === 'task_assigned' || n.type === 'task_due' || n.type === 'task_overdue')
      ).length,
      mention: notifications.filter(n => 
        !n.isRead && (n.type === 'mention' || n.type === 'comment')
      ).length,
      system: notifications.filter(n => 
        !n.isRead && (n.type === 'meeting_reminder' || n.type === 'file_uploaded')
      ).length
    };
  }, [notifications]);

  const getIconForType = (type: string): string => {
    const iconMap: Record<string, string> = {
      task_assigned: '📋',
      task_due: '⏰',
      task_overdue: '⚠️',
      meeting_reminder: '📅',
      mention: '💬',
      comment: '💭',
      file_uploaded: '📎',
      system: '🔔'
    };
    return iconMap[type] || '🔔';
  };

  const getIconClass = (type: string): string => {
    if (type === 'task_assigned' || type === 'task_due' || type === 'task_overdue') {
      return 'task';
    }
    if (type === 'meeting_reminder') {
      return 'meeting';
    }
    if (type === 'mention' || type === 'comment') {
      return 'mention';
    }
    return 'system';
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markNotificationAsRead(notification.id);
    }

    if (notification.relatedType === 'task') {
      Taro.navigateTo({ url: `/pages/task-detail/index?id=${notification.relatedId}` });
    } else if (notification.relatedType === 'meeting') {
      Taro.navigateTo({ url: `/pages/meeting-detail/index?id=${notification.relatedId}` });
    }
  };

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
    Taro.showToast({ title: '已全部标为已读', icon: 'success' });
  };

  const handlePullDownRefresh = () => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  };

  React.useEffect(() => {
    Taro.onPullDownRefresh(handlePullDownRefresh);
    return () => {
      Taro.offPullDownRefresh(handlePullDownRefresh);
    };
  }, []);

  return (
    <View className={styles.notificationsPage}>
      <View className={styles.header}>
        <Text className={styles.title}>通知</Text>
        {unreadCount > 0 && (
          <Text className={styles.markAllRead} onClick={handleMarkAllRead}>全部已读</Text>
        )}
      </View>

      <View className={styles.tabBar}>
        {tabList.map(tab => (
          <Text
            key={tab.key}
            className={classnames(styles.tabItem, activeTab === tab.key && styles.active)}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tab.key !== 'all' && tabUnreadCounts[tab.key as keyof typeof tabUnreadCounts] > 0 && (
              <View className={styles.unreadDot} />
            )}
          </Text>
        ))}
      </View>

      <ScrollView scrollY className={styles.listContainer}>
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(notification => (
            <View
              key={notification.id}
              className={classnames(styles.notificationItem, !notification.isRead && styles.unread)}
              onClick={() => handleNotificationClick(notification)}
            >
              {!notification.isRead && <View className={styles.unreadIndicator} />}
              
              <View className={styles.avatarSection}>
                {notification.senderAvatar ? (
                  <View className={styles.avatar}>
                    <Image src={notification.senderAvatar} mode="aspectFill" />
                  </View>
                ) : (
                  <View className={classnames(styles.systemIcon, styles[getIconClass(notification.type)])}>
                    <Text>{getIconForType(notification.type)}</Text>
                  </View>
                )}
                <View className={styles.iconBadge}>
                  <Text>{getIconForType(notification.type)}</Text>
                </View>
              </View>

              <View className={styles.contentSection}>
                <Text className={styles.title}>{notification.title}</Text>
                <Text className={styles.content}>{notification.content}</Text>
                <Text className={styles.time}>{formatRelativeTime(notification.createdAt)}</Text>
              </View>
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🔔</Text>
            <Text className={styles.emptyText}>暂无通知</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default NotificationsPage;
