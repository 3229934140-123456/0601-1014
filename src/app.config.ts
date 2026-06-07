export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/kanban/index',
    'pages/meetings/index',
    'pages/notifications/index',
    'pages/mine/index',
    'pages/project-detail/index',
    'pages/files/index',
    'pages/members/index',
    'pages/review/index',
    'pages/task-detail/index',
    'pages/meeting-detail/index',
    'pages/create-project/index',
    'pages/search/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: '团队协作',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F5F7FA'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#2F6BFF',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/kanban/index',
        text: '任务'
      },
      {
        pagePath: 'pages/meetings/index',
        text: '会议'
      },
      {
        pagePath: 'pages/notifications/index',
        text: '通知'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
