import { create } from 'zustand';
import { Project, Task, Meeting, Notification, Member, FileItem, MeetingTopic } from '@/types';
import { projects as mockProjects } from '@/data/projects';
import { tasks as mockTasks } from '@/data/tasks';
import { meetings as mockMeetings } from '@/data/meetings';
import { notifications as mockNotifications } from '@/data/notifications';
import { members as mockMembers, currentUserId as mockCurrentUserId } from '@/data/members';
import { files as mockFiles } from '@/data/files';
import { generateId } from '@/utils';

interface AppState {
  projects: Project[];
  tasks: Task[];
  meetings: Meeting[];
  notifications: Notification[];
  files: FileItem[];
  members: Member[];
  currentUserId: string;

  addProjectMember: (projectId: string, memberId: string) => void;
  removeProjectMember: (projectId: string, memberId: string) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'memberCount' | 'taskCount' | 'completedTaskCount' | 'meetingCount' | 'fileCount'> & { memberIds: string[] }) => Project;
  updateProjectStatus: (projectId: string, status: Project['status']) => void;
  getProjectById: (projectId: string) => Project | undefined;
  getMyProjects: (userId: string) => Project[];

  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'comments' | 'attachments'>) => Task;
  updateTaskStatus: (taskId: string, status: Task['status'], completionNote?: string) => void;
  updateTaskAssignee: (taskId: string, assigneeId: string, assigneeName: string, assigneeAvatar: string) => void;
  addTaskComment: (taskId: string, comment: { content: string; authorId: string; authorName: string; authorAvatar: string; mentions?: string[] }) => void;
  addTaskAttachment: (taskId: string, file: FileItem) => void;
  getTaskById: (taskId: string) => Task | undefined;
  getTasksByProject: (projectId: string) => Task[];
  getTasksByStatus: (status: Task['status']) => Task[];
  getMyTasks: (userId: string) => Task[];

  addMeeting: (meeting: Omit<Meeting, 'id' | 'status' | 'attachments'> & { attendeeIds: string[]; topicTitles: string[] }) => Meeting;
  updateMeetingStatus: (meetingId: string, status: Meeting['status']) => void;
  addMeetingTopic: (meetingId: string, topic: { title: string; conclusion?: string; assignee?: string }) => void;
  updateMeetingTopic: (meetingId: string, topicId: string, updates: Partial<MeetingTopic>) => void;
  setMeetingNotes: (meetingId: string, notes: string) => void;
  getMeetingById: (meetingId: string) => Meeting | undefined;
  getMeetingsByProject: (projectId: string) => Meeting[];
  generateTaskFromTopic: (meetingId: string, topicId: string, taskData?: Partial<Task>) => Task | undefined;

  addFile: (file: Omit<FileItem, 'id' | 'uploadTime' | 'isFavorite'>) => FileItem;
  toggleFileFavorite: (fileId: string) => void;
  getFilesByProject: (projectId: string) => FileItem[];
  getMyFavoriteFiles: (userId: string) => FileItem[];
  getFileById: (fileId: string) => FileItem | undefined;

  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  getUnreadCount: () => number;

  getMemberById: (memberId: string) => Member | undefined;
  getCurrentUser: () => Member | undefined;
}

export const useAppStore = create<AppState>((set, get) => ({
  projects: mockProjects,
  tasks: mockTasks,
  meetings: mockMeetings,
  notifications: mockNotifications,
  members: mockMembers,
  currentUserId: mockCurrentUserId,

  addProject: (projectData) => {
    const selectedMembers = projectData.memberIds
      .map(id => get().members.find(m => m.id === id))
      .filter(Boolean) as Member[];
    
    const newProject: Project = {
      id: `p_${generateId()}`,
      name: projectData.name,
      description: projectData.description,
      status: projectData.status,
      coverColor: projectData.coverColor,
      creatorId: projectData.creatorId,
      creatorName: projectData.creatorName,
      members: selectedMembers,
      memberCount: selectedMembers.length,
      taskCount: 0,
      completedTaskCount: 0,
      meetingCount: 0,
      fileCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      endDate: projectData.endDate
    };

    set(state => ({ projects: [newProject, ...state.projects] }));
    return newProject;
  },

  addProjectMember: (projectId, memberId) => {
    set(state => {
      const project = state.projects.find(p => p.id === projectId);
      if (!project) return state;
      
      const member = state.members.find(m => m.id === memberId);
      if (!member) return state;
      
      if (project.members.some(m => m.id === memberId)) return state;
      
      return {
        projects: state.projects.map(p =>
          p.id === projectId
            ? { ...p, members: [...p.members, member], memberCount: p.memberCount + 1 }
            : p
        )
      };
    });
  },

  removeProjectMember: (projectId, memberId) => {
    set(state => {
      const project = state.projects.find(p => p.id === projectId);
      if (!project) return state;
      
      if (!project.members.some(m => m.id === memberId)) return state;
      
      return {
        projects: state.projects.map(p =>
          p.id === projectId
            ? { ...p, members: p.members.filter(m => m.id !== memberId), memberCount: p.memberCount - 1 }
            : p
        )
      };
    });
  },

  updateProjectStatus: (projectId, status) => {
    set(state => ({
      projects: state.projects.map(p => 
        p.id === projectId ? { ...p, status } : p
      )
    }));
  },

  getProjectById: (projectId) => {
    return get().projects.find(p => p.id === projectId);
  },

  getMyProjects: (userId) => {
    return get().projects.filter(p => p.members.some(m => m.id === userId));
  },

  addTask: (taskData) => {
    const newTask: Task = {
      id: `t_${generateId()}`,
      title: taskData.title,
      description: taskData.description,
      status: taskData.status,
      priority: taskData.priority,
      projectId: taskData.projectId,
      projectName: taskData.projectName,
      assigneeId: taskData.assigneeId,
      assigneeName: taskData.assigneeName,
      assigneeAvatar: taskData.assigneeAvatar,
      creatorId: taskData.creatorId,
      creatorName: taskData.creatorName,
      dueDate: taskData.dueDate,
      createdAt: new Date().toISOString(),
      comments: [],
      attachments: []
    };

    set(state => {
      const project = state.projects.find(p => p.id === taskData.projectId);
      const updatedProjects = project
        ? state.projects.map(p => 
            p.id === taskData.projectId 
              ? { ...p, taskCount: p.taskCount + 1 } 
              : p
          )
        : state.projects;

      return {
        tasks: [newTask, ...state.tasks],
        projects: updatedProjects
      };
    });

    return newTask;
  },

  updateTaskStatus: (taskId, status, completionNote) => {
    set(state => {
      const task = state.tasks.find(t => t.id === taskId);
      if (!task) return state;

      let completedDelta = 0;
      if (task.status !== 'done' && status === 'done') {
        completedDelta = 1;
      } else if (task.status === 'done' && status !== 'done') {
        completedDelta = -1;
      }

      const updatedProjects = completedDelta !== 0
        ? state.projects.map(p => 
            p.id === task.projectId 
              ? { ...p, completedTaskCount: p.completedTaskCount + completedDelta } 
              : p
          )
        : state.projects;

      return {
        tasks: state.tasks.map(t => 
          t.id === taskId 
            ? { 
                ...t, 
                status, 
                completedAt: status === 'done' ? new Date().toISOString() : undefined,
                completionNote: completionNote || t.completionNote
              } 
            : t
        ),
        projects: updatedProjects
      };
    });
  },

  updateTaskAssignee: (taskId, assigneeId, assigneeName, assigneeAvatar) => {
    set(state => ({
      tasks: state.tasks.map(t => 
        t.id === taskId 
          ? { ...t, assigneeId, assigneeName, assigneeAvatar } 
          : t
      )
    }));
  },

  addTaskComment: (taskId, commentData) => {
    const newComment = {
      id: `c_${generateId()}`,
      content: commentData.content,
      authorId: commentData.authorId,
      authorName: commentData.authorName,
      authorAvatar: commentData.authorAvatar,
      createdAt: new Date().toISOString(),
      mentions: commentData.mentions || []
    };

    set(state => {
      const task = state.tasks.find(t => t.id === taskId);
      
      const newNotifications = (commentData.mentions || []).map(mentionedId => {
        const mentionedMember = state.members.find(m => m.id === mentionedId);
        return {
          id: `n_${generateId()}`,
          type: 'mention' as const,
          title: '有人@了你',
          content: `${commentData.authorName}在任务「${task?.title || ''}」的评论中@了你`,
          relatedId: taskId,
          relatedType: 'task' as const,
          senderId: commentData.authorId,
          senderName: commentData.authorName,
          senderAvatar: commentData.authorAvatar,
          isRead: false,
          createdAt: new Date().toISOString()
        };
      });

      return {
        tasks: state.tasks.map(t => 
          t.id === taskId 
            ? { ...t, comments: [...t.comments, newComment] } 
            : t
        ),
        notifications: [...newNotifications, ...state.notifications]
      };
    });
  },

  addTaskAttachment: (taskId, file) => {
    set(state => {
      const task = state.tasks.find(t => t.id === taskId);
      if (!task) return state;
      
      const updatedProjects = state.projects.map(p =>
        p.id === task.projectId
          ? { ...p, fileCount: p.fileCount + 1 }
          : p
      );
      
      return {
        tasks: state.tasks.map(t => 
          t.id === taskId 
            ? { ...t, attachments: [...t.attachments, file] } 
            : t
        ),
        files: [file, ...state.files],
        projects: updatedProjects
      };
    });
  },

  getTaskById: (taskId) => {
    return get().tasks.find(t => t.id === taskId);
  },

  getTasksByProject: (projectId) => {
    return get().tasks.filter(t => t.projectId === projectId);
  },

  getTasksByStatus: (status) => {
    return get().tasks.filter(t => t.status === status);
  },

  getMyTasks: (userId) => {
    return get().tasks.filter(t => t.assigneeId === userId);
  },

  addMeeting: (meetingData) => {
    const attendees = meetingData.attendeeIds
      .map(id => get().members.find(m => m.id === id))
      .filter(Boolean) as Member[];

    const topics: MeetingTopic[] = meetingData.topicTitles.map((title, index) => ({
      id: `tp_${generateId()}_${index}`,
      title,
      taskGenerated: false
    }));

    const newMeeting: Meeting = {
      id: `meeting_${generateId()}`,
      title: meetingData.title,
      projectId: meetingData.projectId,
      projectName: meetingData.projectName,
      startTime: meetingData.startTime,
      endTime: meetingData.endTime,
      location: meetingData.location,
      organizerId: meetingData.organizerId,
      organizerName: meetingData.organizerName,
      attendees,
      topics,
      status: 'upcoming',
      attachments: []
    };

    set(state => {
      const project = state.projects.find(p => p.id === meetingData.projectId);
      const updatedProjects = project
        ? state.projects.map(p => 
            p.id === meetingData.projectId 
              ? { ...p, meetingCount: p.meetingCount + 1 } 
              : p
          )
        : state.projects;

      return {
        meetings: [newMeeting, ...state.meetings],
        projects: updatedProjects
      };
    });

    return newMeeting;
  },

  updateMeetingStatus: (meetingId, status) => {
    set(state => ({
      meetings: state.meetings.map(m => 
        m.id === meetingId ? { ...m, status } : m
      )
    }));
  },

  addMeetingTopic: (meetingId, topic) => {
    const newTopic: MeetingTopic = {
      id: `tp_${generateId()}`,
      title: topic.title,
      conclusion: topic.conclusion,
      assignee: topic.assignee,
      taskGenerated: false
    };

    set(state => ({
      meetings: state.meetings.map(m => 
        m.id === meetingId 
          ? { ...m, topics: [...m.topics, newTopic] } 
          : m
      )
    }));
  },

  updateMeetingTopic: (meetingId, topicId, updates) => {
    set(state => ({
      meetings: state.meetings.map(m => 
        m.id === meetingId 
          ? { 
              ...m, 
              topics: m.topics.map(t => 
                t.id === topicId ? { ...t, ...updates } : t
              ) 
            } 
          : m
      )
    }));
  },

  setMeetingNotes: (meetingId, notes) => {
    set(state => ({
      meetings: state.meetings.map(m => 
        m.id === meetingId ? { ...m, notes } : m
      )
    }));
  },

  getMeetingById: (meetingId) => {
    return get().meetings.find(m => m.id === meetingId);
  },

  getMeetingsByProject: (projectId) => {
    return get().meetings.filter(m => m.projectId === projectId);
  },

  generateTaskFromTopic: (meetingId, topicId, taskData) => {
    const meeting = get().meetings.find(m => m.id === meetingId);
    if (!meeting) return undefined;
    
    const topic = meeting.topics.find(t => t.id === topicId);
    if (!topic || topic.taskGenerated) return undefined;
    
    const assigneeId = topic.assignee || get().currentUserId;
    const assigneeMember = get().members.find(m => m.id === assigneeId);
    
    const newTask = get().addTask({
      title: topic.title,
      description: topic.conclusion || '',
      status: 'todo',
      priority: taskData?.priority || 'medium',
      projectId: meeting.projectId,
      projectName: meeting.projectName,
      assigneeId,
      assigneeName: assigneeMember?.name || '',
      assigneeAvatar: assigneeMember?.avatar || '',
      creatorId: get().currentUserId,
      creatorName: get().getCurrentUser()?.name || '',
      dueDate: taskData?.dueDate || topic.dueDate
    });
    
    get().updateMeetingTopic(meetingId, topicId, { taskGenerated: true, generatedTaskId: newTask.id });
    
    return newTask;
  },

  addFile: (fileData) => {
    const newFile: FileItem = {
      ...fileData,
      id: `f_${generateId()}`,
      uploadTime: new Date().toISOString(),
      isFavorite: false
    };

    set(state => {
      const updatedProjects = state.projects.map(p =>
        p.id === fileData.projectId
          ? { ...p, fileCount: p.fileCount + 1 }
          : p
      );
      
      return {
        files: [newFile, ...state.files],
        projects: updatedProjects
      };
    });

    return newFile;
  },

  toggleFileFavorite: (fileId) => {
    set(state => ({
      files: state.files.map(f =>
        f.id === fileId ? { ...f, isFavorite: !f.isFavorite } : f
      )
    }));
  },

  getFilesByProject: (projectId) => {
    return get().files.filter(f => f.projectId === projectId);
  },

  getMyFavoriteFiles: () => {
    return get().files.filter(f => f.isFavorite);
  },

  getFileById: (fileId) => {
    return get().files.find(f => f.id === fileId);
  },

  addNotification: (notificationData) => {
    const newNotification: Notification = {
      id: `n_${generateId()}`,
      ...notificationData,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    set(state => ({
      notifications: [newNotification, ...state.notifications]
    }));
  },

  markNotificationAsRead: (notificationId) => {
    set(state => ({
      notifications: state.notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    }));
  },

  markAllNotificationsAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true }))
    }));
  },

  getUnreadCount: () => {
    return get().notifications.filter(n => !n.isRead).length;
  },

  getMemberById: (memberId) => {
    return get().members.find(m => m.id === memberId);
  },

  getCurrentUser: () => {
    return get().members.find(m => m.id === get().currentUserId);
  }
}));
