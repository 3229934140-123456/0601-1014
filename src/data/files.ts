import { FileItem } from '@/types';

export const files: FileItem[] = [
  {
    id: 'f1',
    name: '电商平台重构项目需求文档v1.0.docx',
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
    name: '首页设计稿.fig',
    type: 'design',
    size: '15.8MB',
    url: '',
    uploaderId: 'm5',
    uploaderName: '刘洋',
    uploadTime: '2026-06-03 16:30',
    isFavorite: true,
    projectId: 'p1'
  },
  {
    id: 'f3',
    name: '技术架构设计.pdf',
    type: 'pdf',
    size: '3.2MB',
    url: '',
    uploaderId: 'm4',
    uploaderName: '陈伟',
    uploadTime: '2026-06-02 14:00',
    isFavorite: false,
    projectId: 'p1'
  },
  {
    id: 'f4',
    name: '接口文档.md',
    type: 'doc',
    size: '856KB',
    url: '',
    uploaderId: 'm4',
    uploaderName: '陈伟',
    uploadTime: '2026-06-05 09:30',
    isFavorite: false,
    projectId: 'p1'
  },
  {
    id: 'f5',
    name: '测试用例.xlsx',
    type: 'excel',
    size: '1.8MB',
    url: '',
    uploaderId: 'm6',
    uploaderName: '赵雪',
    uploadTime: '2026-06-04 11:00',
    isFavorite: false,
    projectId: 'p1'
  },
  {
    id: 'f6',
    name: 'App设计规范.pdf',
    type: 'pdf',
    size: '5.6MB',
    url: '',
    uploaderId: 'm5',
    uploaderName: '刘洋',
    uploadTime: '2026-06-02 10:00',
    isFavorite: true,
    projectId: 'p2'
  },
  {
    id: 'f7',
    name: '移动端交互原型.rp',
    type: 'design',
    size: '25.3MB',
    url: '',
    uploaderId: 'm2',
    uploaderName: '李华',
    uploadTime: '2026-06-01 15:00',
    isFavorite: false,
    projectId: 'p2'
  },
  {
    id: 'f8',
    name: '数据分析需求清单.docx',
    type: 'doc',
    size: '1.2MB',
    url: '',
    uploaderId: 'm7',
    uploaderName: '孙磊',
    uploadTime: '2026-05-28 09:00',
    isFavorite: false,
    projectId: 'p3'
  },
  {
    id: 'f9',
    name: '数据看板设计稿.sketch',
    type: 'design',
    size: '18.5MB',
    url: '',
    uploaderId: 'm5',
    uploaderName: '刘洋',
    uploadTime: '2026-06-03 14:00',
    isFavorite: true,
    projectId: 'p3'
  },
  {
    id: 'f10',
    name: '客服话术模板.docx',
    type: 'doc',
    size: '680KB',
    url: '',
    uploaderId: 'm8',
    uploaderName: '周婷',
    uploadTime: '2026-06-04 16:00',
    isFavorite: false,
    projectId: 'p6'
  },
  {
    id: 'f11',
    name: 'AI技术方案.pdf',
    type: 'pdf',
    size: '4.1MB',
    url: '',
    uploaderId: 'm3',
    uploaderName: '王芳',
    uploadTime: '2026-06-02 11:00',
    isFavorite: false,
    projectId: 'p6'
  },
  {
    id: 'f12',
    name: '项目总结报告.pptx',
    type: 'ppt',
    size: '8.9MB',
    url: '',
    uploaderId: 'm1',
    uploaderName: '张明',
    uploadTime: '2026-04-28 17:00',
    isFavorite: true,
    projectId: 'p5'
  }
];

export const getFilesByProject = (projectId: string): FileItem[] => {
  return files.filter(f => f.projectId === projectId);
};

export const getFavoriteFiles = (): FileItem[] => {
  return files.filter(f => f.isFavorite);
};

export const searchFiles = (keyword: string): FileItem[] => {
  const lower = keyword.toLowerCase();
  return files.filter(f => f.name.toLowerCase().includes(lower));
};
