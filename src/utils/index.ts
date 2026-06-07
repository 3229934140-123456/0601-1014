import dayjs from 'dayjs';

export const formatDate = (date: string, format: string = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format);
};

export const formatDateTime = (date: string): string => {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
};

export const formatRelativeTime = (date: string): string => {
  const now = dayjs();
  const target = dayjs(date);
  const diffDays = now.diff(target, 'day');
  
  if (diffDays === 0) {
    const diffHours = now.diff(target, 'hour');
    if (diffHours === 0) {
      const diffMinutes = now.diff(target, 'minute');
      if (diffMinutes === 0) return '刚刚';
      return `${diffMinutes}分钟前`;
    }
    return `${diffHours}小时前`;
  }
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;
  return formatDate(date);
};

export const isOverdue = (dueDate: string): boolean => {
  return dayjs(dueDate).isBefore(dayjs(), 'day');
};

export const isDueSoon = (dueDate: string, days: number = 3): boolean => {
  const due = dayjs(dueDate);
  const now = dayjs();
  return due.isAfter(now, 'day') && due.diff(now, 'day') <= days;
};

export const getStatusText = (status: string): string => {
  const map: Record<string, string> = {
    todo: '待开始',
    in_progress: '进行中',
    review: '待审核',
    done: '已完成',
    upcoming: '即将开始',
    ongoing: '进行中',
    finished: '已结束',
    active: '进行中',
    archived: '已归档',
    paused: '已暂停'
  };
  return map[status] || status;
};

export const getPriorityText = (priority: string): string => {
  const map: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高'
  };
  return map[priority] || priority;
};

export const getFileIcon = (type: string): string => {
  const map: Record<string, string> = {
    doc: '📄',
    pdf: '📕',
    excel: '📊',
    ppt: '📽️',
    design: '🎨',
    image: '🖼️',
    video: '🎬',
    audio: '🔊',
    zip: '📦',
    code: '💻'
  };
  return map[type] || '📁';
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
