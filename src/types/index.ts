export interface Member {
  id: string;
  name: string;
  avatar: string;
  role: string;
  department: string;
  email: string;
  phone?: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  projectId: string;
  projectName: string;
  assigneeId: string;
  assigneeName: string;
  assigneeAvatar: string;
  creatorId: string;
  creatorName: string;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  completionNote?: string;
  comments: Comment[];
  attachments: FileItem[];
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
  mentions?: string[];
}

export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: string;
  url: string;
  uploaderId: string;
  uploaderName: string;
  uploadTime: string;
  isFavorite: boolean;
  projectId: string;
}

export interface MeetingTopic {
  id: string;
  title: string;
  conclusion?: string;
  assignee?: string;
  taskGenerated?: boolean;
}

export interface Meeting {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  startTime: string;
  endTime: string;
  location: string;
  organizerId: string;
  organizerName: string;
  attendees: Member[];
  topics: MeetingTopic[];
  status: 'upcoming' | 'ongoing' | 'finished';
  notes?: string;
  attachments: FileItem[];
}

export type ProjectStatus = 'active' | 'archived' | 'paused';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  coverColor: string;
  creatorId: string;
  creatorName: string;
  members: Member[];
  memberCount: number;
  taskCount: number;
  completedTaskCount: number;
  meetingCount: number;
  fileCount: number;
  createdAt: string;
  endDate?: string;
}

export type NotificationType = 'task_assigned' | 'task_due' | 'task_overdue' | 'meeting_reminder' | 'mention' | 'comment' | 'file_uploaded';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  relatedId: string;
  relatedType: 'task' | 'meeting' | 'file' | 'project';
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  isRead: boolean;
  createdAt: string;
}

export interface WeeklyReport {
  id: string;
  weekStart: string;
  weekEnd: string;
  completedTasks: number;
  totalTasks: number;
  meetings: number;
  files: number;
  summary: string;
  highlights: string[];
  nextWeekPlan: string[];
}

export interface ReviewItem {
  id: string;
  projectId: string;
  projectName: string;
  type: 'weekly' | 'project';
  title: string;
  content: string;
  createdAt: string;
  authorId: string;
  authorName: string;
}
