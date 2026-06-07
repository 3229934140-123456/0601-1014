import { Meeting, MeetingTopic } from '@/types';
import { members } from './members';

const topics1: MeetingTopic[] = [
  { id: 'tp1', title: '项目进度回顾', conclusion: '整体进度符合预期，前端模块稍有滞后', taskGenerated: false },
  { id: 'tp2', title: '需求变更讨论', conclusion: '同意增加搜索功能，由产品组更新需求文档', assignee: 'm2', taskGenerated: true },
  { id: 'tp3', title: '下周工作安排', conclusion: '重点推进用户模块和支付模块开发', taskGenerated: false }
];

const topics2: MeetingTopic[] = [
  { id: 'tp4', title: 'UI设计评审', conclusion: '整体设计风格通过，细节需要调整', assignee: 'm5', taskGenerated: true },
  { id: 'tp5', title: '技术方案讨论', taskGenerated: false }
];

export const meetings: Meeting[] = [
  {
    id: 'meeting1',
    title: '电商平台重构项目周会',
    projectId: 'p1',
    projectName: '电商平台重构项目',
    startTime: '2026-06-10 14:00',
    endTime: '2026-06-10 15:30',
    location: '会议室A',
    organizerId: 'm1',
    organizerName: '张明',
    attendees: members.slice(0, 6),
    topics: topics1,
    status: 'upcoming',
    attachments: []
  },
  {
    id: 'meeting2',
    title: '移动端App设计评审',
    projectId: 'p2',
    projectName: '移动端App开发',
    startTime: '2026-06-09 10:00',
    endTime: '2026-06-09 11:30',
    location: '会议室B',
    organizerId: 'm2',
    organizerName: '李华',
    attendees: [members[1], members[2], members[4], members[5]],
    topics: topics2,
    status: 'upcoming',
    attachments: []
  },
  {
    id: 'meeting3',
    title: '数据分析平台需求确认',
    projectId: 'p3',
    projectName: '数据分析平台',
    startTime: '2026-06-08 09:30',
    endTime: '2026-06-08 10:30',
    location: '线上会议',
    organizerId: 'm7',
    organizerName: '孙磊',
    attendees: [members[0], members[3], members[4], members[7]],
    topics: [
      { id: 'tp6', title: '数据看板需求确认', conclusion: '确认5个核心数据指标看板', taskGenerated: true },
      { id: 'tp7', title: '报表功能讨论', conclusion: '支持自定义报表和定时推送', taskGenerated: false }
    ],
    status: 'finished',
    notes: '本次会议确认了数据分析平台的核心需求，下一步由产品组输出详细需求文档。',
    attachments: []
  },
  {
    id: 'meeting4',
    title: '智能客服系统启动会',
    projectId: 'p6',
    projectName: '智能客服系统',
    startTime: '2026-06-05 14:00',
    endTime: '2026-06-05 15:00',
    location: '会议室C',
    organizerId: 'm3',
    organizerName: '王芳',
    attendees: [members[2], members[3], members[5], members[8]],
    topics: [
      { id: 'tp8', title: '项目目标确认', conclusion: '三个月内完成一期开发，实现基础客服功能', taskGenerated: false },
      { id: 'tp9', title: '团队分工', conclusion: '技术组负责系统开发，运营组负责知识库建设', taskGenerated: true }
    ],
    status: 'finished',
    notes: '项目正式启动，下周开始详细设计工作。',
    attachments: []
  },
  {
    id: 'meeting5',
    title: '电商平台重构项目复盘会',
    projectId: 'p1',
    projectName: '电商平台重构项目',
    startTime: '2026-06-03 16:00',
    endTime: '2026-06-03 17:30',
    location: '会议室A',
    organizerId: 'm1',
    organizerName: '张明',
    attendees: members.slice(0, 6),
    topics: [
      { id: 'tp10', title: '上月工作总结', conclusion: '完成12个功能模块，整体进度符合计划', taskGenerated: false },
      { id: 'tp11', title: '问题总结', conclusion: '沟通效率有待提高，建议增加站会频率', taskGenerated: false },
      { id: 'tp12', title: '下月计划', conclusion: '重点推进支付和订单模块', taskGenerated: true }
    ],
    status: 'finished',
    notes: '上月工作整体顺利，下月继续保持节奏。',
    attachments: []
  },
  {
    id: 'meeting6',
    title: '官网改版总结会',
    projectId: 'p5',
    projectName: '官网改版项目',
    startTime: '2026-04-28 10:00',
    endTime: '2026-04-28 11:00',
    location: '会议室D',
    organizerId: 'm1',
    organizerName: '张明',
    attendees: members.slice(2, 7),
    topics: [
      { id: 'tp13', title: '项目总结', conclusion: '项目顺利上线，各项指标达标', taskGenerated: false }
    ],
    status: 'finished',
    notes: '项目圆满结束，感谢大家的付出！',
    attachments: []
  }
];

export const getMeetingsByProject = (projectId: string): Meeting[] => {
  return meetings.filter(m => m.projectId === projectId);
};

export const getUpcomingMeetings = (): Meeting[] => {
  return meetings.filter(m => m.status === 'upcoming');
};

export const getFinishedMeetings = (): Meeting[] => {
  return meetings.filter(m => m.status === 'finished');
};
