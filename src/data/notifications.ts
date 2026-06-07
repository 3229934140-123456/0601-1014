import { Notification } from '@/types';

export const notifications: Notification[] = [
  {
    id: 'n1',
    type: 'task_overdue',
    title: '任务逾期提醒',
    content: '您有一个任务「支付功能测试」已逾期，请尽快处理',
    relatedId: 't4',
    relatedType: 'task',
    senderId: 'system',
    senderName: '系统通知',
    isRead: false,
    createdAt: '2026-06-08 09:00'
  },
  {
    id: 'n2',
    type: 'mention',
    title: '有人@了你',
    content: '张明在评论中@了你：这个任务的优先级需要提高一下',
    relatedId: 't2',
    relatedType: 'task',
    senderId: 'm1',
    senderName: '张明',
    senderAvatar: 'https://picsum.photos/id/64/200/200',
    isRead: false,
    createdAt: '2026-06-08 10:30'
  },
  {
    id: 'n3',
    type: 'meeting_reminder',
    title: '会议提醒',
    content: '「电商平台重构项目周会」将在明天下午2点开始',
    relatedId: 'meeting1',
    relatedType: 'meeting',
    senderId: 'system',
    senderName: '系统通知',
    isRead: false,
    createdAt: '2026-06-08 08:00'
  },
  {
    id: 'n4',
    type: 'task_assigned',
    title: '新任务分配',
    content: '张明给您分配了新任务「首页界面设计优化」',
    relatedId: 't1',
    relatedType: 'task',
    senderId: 'm1',
    senderName: '张明',
    senderAvatar: 'https://picsum.photos/id/64/200/200',
    isRead: true,
    createdAt: '2026-06-07 14:20'
  },
  {
    id: 'n5',
    type: 'comment',
    title: '新评论',
    content: '王芳评论了任务「用户登录模块开发」',
    relatedId: 't2',
    relatedType: 'task',
    senderId: 'm3',
    senderName: '王芳',
    senderAvatar: 'https://picsum.photos/id/177/200/200',
    isRead: true,
    createdAt: '2026-06-07 11:00'
  },
  {
    id: 'n6',
    type: 'file_uploaded',
    title: '新文件上传',
    content: '刘洋上传了新文件「首页设计稿.fig」',
    relatedId: 'f2',
    relatedType: 'file',
    senderId: 'm5',
    senderName: '刘洋',
    senderAvatar: 'https://picsum.photos/id/1027/200/200',
    isRead: true,
    createdAt: '2026-06-06 16:30'
  },
  {
    id: 'n7',
    type: 'task_due',
    title: '任务即将到期',
    content: '「商品列表页接口开发」将在3天后到期',
    relatedId: 't3',
    relatedType: 'task',
    senderId: 'system',
    senderName: '系统通知',
    isRead: true,
    createdAt: '2026-06-06 09:00'
  },
  {
    id: 'n8',
    type: 'mention',
    title: '有人@了你',
    content: '李华在会议中@了你，请确认技术方案',
    relatedId: 'meeting2',
    relatedType: 'meeting',
    senderId: 'm2',
    senderName: '李华',
    senderAvatar: 'https://picsum.photos/id/91/200/200',
    isRead: true,
    createdAt: '2026-06-05 15:30'
  }
];

export const getUnreadCount = (): number => {
  return notifications.filter(n => !n.isRead).length;
};

export const getNotificationsByType = (type: string): Notification[] => {
  if (type === 'all') return notifications;
  return notifications.filter(n => n.type === type);
};
