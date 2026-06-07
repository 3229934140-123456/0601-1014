import { Task, Comment, FileItem } from '@/types';

const mockComments: Comment[] = [
  {
    id: 'c1',
    content: '这个任务的优先级需要提高一下，下周就要上线了',
    authorId: 'm1',
    authorName: '张明',
    authorAvatar: 'https://picsum.photos/id/64/200/200',
    createdAt: '2026-06-05 14:30',
    mentions: ['m3']
  },
  {
    id: 'c2',
    content: '好的，我会加快进度，预计周三可以完成',
    authorId: 'm3',
    authorName: '王芳',
    authorAvatar: 'https://picsum.photos/id/177/200/200',
    createdAt: '2026-06-05 15:00'
  }
];

const mockAttachments: FileItem[] = [
  {
    id: 'f1',
    name: '需求文档v1.0.docx',
    type: 'doc',
    size: '2.5MB',
    url: '',
    uploaderId: 'm2',
    uploaderName: '李华',
    uploadTime: '2026-06-01 10:00',
    isFavorite: true,
    projectId: 'p1'
  },
  {
    id: 'f2',
    name: '设计稿.fig',
    type: 'design',
    size: '15.8MB',
    url: '',
    uploaderId: 'm5',
    uploaderName: '刘洋',
    uploadTime: '2026-06-03 16:30',
    isFavorite: false,
    projectId: 'p1'
  }
];

export const tasks: Task[] = [
  {
    id: 't1',
    title: '首页界面设计优化',
    description: '根据用户反馈优化首页布局和视觉效果，提升用户体验',
    status: 'todo',
    priority: 'high',
    projectId: 'p1',
    projectName: '电商平台重构项目',
    assigneeId: 'm5',
    assigneeName: '刘洋',
    assigneeAvatar: 'https://picsum.photos/id/1027/200/200',
    creatorId: 'm2',
    creatorName: '李华',
    dueDate: '2026-06-15',
    createdAt: '2026-06-01 09:00',
    comments: [],
    attachments: []
  },
  {
    id: 't2',
    title: '用户登录模块开发',
    description: '开发用户登录、注册、密码找回功能，支持手机号和邮箱登录',
    status: 'in_progress',
    priority: 'high',
    projectId: 'p1',
    projectName: '电商平台重构项目',
    assigneeId: 'm3',
    assigneeName: '王芳',
    assigneeAvatar: 'https://picsum.photos/id/177/200/200',
    creatorId: 'm1',
    creatorName: '张明',
    dueDate: '2026-06-12',
    createdAt: '2026-05-28 10:00',
    comments: mockComments,
    attachments: mockAttachments
  },
  {
    id: 't3',
    title: '商品列表页接口开发',
    description: '开发商品列表、分类筛选、排序等后端接口',
    status: 'in_progress',
    priority: 'medium',
    projectId: 'p1',
    projectName: '电商平台重构项目',
    assigneeId: 'm4',
    assigneeName: '陈伟',
    assigneeAvatar: 'https://picsum.photos/id/338/200/200',
    creatorId: 'm1',
    creatorName: '张明',
    dueDate: '2026-06-18',
    createdAt: '2026-06-02 09:30',
    comments: [],
    attachments: []
  },
  {
    id: 't4',
    title: '支付功能测试',
    description: '对支付流程进行全面测试，确保支付安全稳定',
    status: 'review',
    priority: 'high',
    projectId: 'p1',
    projectName: '电商平台重构项目',
    assigneeId: 'm6',
    assigneeName: '赵雪',
    assigneeAvatar: 'https://picsum.photos/id/237/200/200',
    creatorId: 'm1',
    creatorName: '张明',
    dueDate: '2026-06-10',
    createdAt: '2026-05-25 14:00',
    comments: [],
    attachments: []
  },
  {
    id: 't5',
    title: '购物车功能开发',
    description: '实现购物车添加、删除、数量修改、结算等功能',
    status: 'done',
    priority: 'medium',
    projectId: 'p1',
    projectName: '电商平台重构项目',
    assigneeId: 'm3',
    assigneeName: '王芳',
    assigneeAvatar: 'https://picsum.photos/id/177/200/200',
    creatorId: 'm1',
    creatorName: '张明',
    dueDate: '2026-06-05',
    createdAt: '2026-05-20 10:00',
    completedAt: '2026-06-04 18:00',
    completionNote: '购物车功能已全部开发完成，包含商品添加、删除、数量调整、全选、结算等功能，已通过测试验收。',
    comments: [],
    attachments: []
  },
  {
    id: 't6',
    title: 'App首页设计',
    description: '设计移动端App首页布局和交互',
    status: 'todo',
    priority: 'high',
    projectId: 'p2',
    projectName: '移动端App开发',
    assigneeId: 'm5',
    assigneeName: '刘洋',
    assigneeAvatar: 'https://picsum.photos/id/1027/200/200',
    creatorId: 'm2',
    creatorName: '李华',
    dueDate: '2026-06-20',
    createdAt: '2026-06-03 11:00',
    comments: [],
    attachments: []
  },
  {
    id: 't7',
    title: '用户中心开发',
    description: '开发移动端用户中心页面，包含个人信息、订单、收藏等',
    status: 'in_progress',
    priority: 'medium',
    projectId: 'p2',
    projectName: '移动端App开发',
    assigneeId: 'm3',
    assigneeName: '王芳',
    assigneeAvatar: 'https://picsum.photos/id/177/200/200',
    creatorId: 'm2',
    creatorName: '李华',
    dueDate: '2026-06-25',
    createdAt: '2026-06-01 09:00',
    comments: [],
    attachments: []
  },
  {
    id: 't8',
    title: '数据可视化图表开发',
    description: '开发多种数据可视化图表组件',
    status: 'todo',
    priority: 'medium',
    projectId: 'p3',
    projectName: '数据分析平台',
    assigneeId: 'm3',
    assigneeName: '王芳',
    assigneeAvatar: 'https://picsum.photos/id/177/200/200',
    creatorId: 'm1',
    creatorName: '张明',
    dueDate: '2026-06-30',
    createdAt: '2026-06-05 10:00',
    comments: [],
    attachments: []
  },
  {
    id: 't9',
    title: '报表导出功能',
    description: '支持Excel、PDF等多种格式的报表导出',
    status: 'review',
    priority: 'low',
    projectId: 'p3',
    projectName: '数据分析平台',
    assigneeId: 'm4',
    assigneeName: '陈伟',
    assigneeAvatar: 'https://picsum.photos/id/338/200/200',
    creatorId: 'm1',
    creatorName: '张明',
    dueDate: '2026-06-15',
    createdAt: '2026-05-28 14:00',
    comments: [],
    attachments: []
  },
  {
    id: 't10',
    title: '性能优化',
    description: '优化系统性能，提升页面加载速度',
    status: 'done',
    priority: 'high',
    projectId: 'p5',
    projectName: '官网改版项目',
    assigneeId: 'm4',
    assigneeName: '陈伟',
    assigneeAvatar: 'https://picsum.photos/id/338/200/200',
    creatorId: 'm1',
    creatorName: '张明',
    dueDate: '2026-04-20',
    createdAt: '2026-03-15 10:00',
    completedAt: '2026-04-18 17:00',
    completionNote: '已完成首页加载优化、图片懒加载、代码分割等优化工作，首页加载时间从3.2s降至1.1s。',
    comments: [],
    attachments: []
  },
  {
    id: 't11',
    title: '客服机器人训练',
    description: '训练智能客服机器人的问答能力',
    status: 'todo',
    priority: 'medium',
    projectId: 'p6',
    projectName: '智能客服系统',
    assigneeId: 'm8',
    assigneeName: '周婷',
    assigneeAvatar: 'https://picsum.photos/id/718/200/200',
    creatorId: 'm3',
    creatorName: '王芳',
    dueDate: '2026-07-10',
    createdAt: '2026-06-01 09:00',
    comments: [],
    attachments: []
  },
  {
    id: 't12',
    title: '客服系统对接',
    description: '智能客服系统与现有业务系统对接',
    status: 'in_progress',
    priority: 'high',
    projectId: 'p6',
    projectName: '智能客服系统',
    assigneeId: 'm3',
    assigneeName: '王芳',
    assigneeAvatar: 'https://picsum.photos/id/177/200/200',
    creatorId: 'm3',
    creatorName: '王芳',
    dueDate: '2026-07-15',
    createdAt: '2026-05-28 10:00',
    comments: [],
    attachments: []
  }
];

export const getTasksByProject = (projectId: string): Task[] => {
  return tasks.filter(task => task.projectId === projectId);
};

export const getTasksByStatus = (status: string): Task[] => {
  return tasks.filter(task => task.status === status);
};

export const getMyTasks = (userId: string): Task[] => {
  return tasks.filter(task => task.assigneeId === userId);
};
