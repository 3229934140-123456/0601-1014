import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useAppStore';
import { Task, TaskStatus } from '@/types';
import StatusTag from '@/components/StatusTag';
import { isOverdue, formatDate } from '@/utils';

const taskTabs = [
  { key: 'todo', label: '待开始' },
  { key: 'in_progress', label: '进行中' },
  { key: 'review', label: '待审核' },
  { key: 'overdue', label: '已逾期' }
];

const MinePage: React.FC = () => {
  const [activeTaskTab, setActiveTaskTab] = useState('todo');

  const currentUser = useAppStore(state => state.getCurrentUser());
  const currentUserId = useAppStore(state => state.currentUserId);
  const getMyProjects = useAppStore(state => state.getMyProjects);
  const getMyTasks = useAppStore(state => state.getMyTasks);
  const getMyFavoriteFiles = useAppStore(state => state.getMyFavoriteFiles);
  const updateTaskStatus = useAppStore(state => state.updateTaskStatus);

  const myProjects = useMemo(() => getMyProjects(currentUserId), [getMyProjects, currentUserId]);
  const myTasks = useMemo(() => getMyTasks(currentUserId), [getMyTasks, currentUserId]);
  const completedTasks = useMemo(() => myTasks.filter(t => t.status === 'done').length, [myTasks]);
  const favoriteFiles = useMemo(() => getMyFavoriteFiles(), [getMyFavoriteFiles]);

  const displayedTasks = useMemo(() => {
    if (activeTaskTab === 'overdue') {
      return myTasks.filter(t => t.status !== 'done' && isOverdue(t.dueDate));
    }
    return myTasks.filter(t => t.status === activeTaskTab);
  }, [myTasks, activeTaskTab]);

  const handleMyProjects = () => {
    Taro.switchTab({ url: '/pages/home/index' });
  };

  const handleTaskClick = (taskId: string) => {
    Taro.navigateTo({ url: `/pages/task-detail/index?id=${taskId}` });
  };

  const handleTaskStatusChange = (task: Task, e: any) => {
    e.stopPropagation?.();
    const statusOptions = [
      { key: 'todo', label: '待开始' },
      { key: 'in_progress', label: '进行中' },
      { key: 'review', label: '待审核' },
      { key: 'done', label: '已完成' }
    ];
    
    Taro.showActionSheet({
      itemList: statusOptions.map(o => o.label),
      success: (res) => {
        const newStatus = statusOptions[res.tapIndex].key as TaskStatus;
        if (newStatus !== task.status) {
          if (newStatus === 'done') {
            Taro.showModal({
              title: '完成任务',
              content: '请输入完成说明',
              editable: true,
              placeholderText: '请输入完成说明...',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  updateTaskStatus(task.id, 'done', modalRes.content || '任务已完成');
                  Taro.showToast({ title: '任务已完成', icon: 'success' });
                }
              }
            });
          } else {
            updateTaskStatus(task.id, newStatus);
            Taro.showToast({ title: '状态已更新', icon: 'success' });
          }
        }
      }
    });
  };

  const handleMyFavorites = () => {
    if (myProjects.length > 0) {
      Taro.navigateTo({ url: `/pages/files/index?projectId=${myProjects[0].id}&filter=favorite` });
    } else {
      Taro.showToast({ title: '暂无项目', icon: 'none' });
    }
  };

  const handleWeeklyReport = () => {
    Taro.navigateTo({ url: '/pages/review/index' });
  };

  const handleMembers = () => {
    if (myProjects.length > 0) {
      Taro.navigateTo({ url: `/pages/members/index?projectId=${myProjects[0].id}` });
    }
  };

  const handleSettings = () => {
    Taro.showToast({ title: '设置', icon: 'none' });
  };

  const handleHelp = () => {
    Taro.showToast({ title: '帮助与反馈', icon: 'none' });
  };

  const handleAbout = () => {
    Taro.showToast({ title: '关于我们', icon: 'none' });
  };

  const handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已退出', icon: 'success' });
        }
      }
    });
  };

  return (
    <ScrollView className={styles.minePage} scrollY>
      <View className={styles.header}>
        <View className={styles.userInfo}>
          <View className={styles.avatar}>
            <Image src={currentUser?.avatar || 'https://picsum.photos/id/64/200/200'} mode="aspectFill" />
          </View>
          <View className={styles.info}>
            <Text className={styles.name}>{currentUser?.name || '用户'}</Text>
            <Text className={styles.role}>{currentUser?.role || '成员'}</Text>
            <Text className={styles.department}>{currentUser?.department || ''}</Text>
          </View>
          <Text className={styles.settingsBtn} onClick={handleSettings}>⚙️</Text>
        </View>
      </View>

      <View className={styles.statsCard}>
        <View className={styles.statItem} onClick={handleMyProjects}>
          <Text className={styles.statNumber}>{myProjects.length}</Text>
          <Text className={styles.statLabel}>参与项目</Text>
        </View>
        <View className={styles.divider} />
        <View className={styles.statItem} onClick={() => setActiveTaskTab('in_progress')}>
          <Text className={styles.statNumber}>{completedTasks}</Text>
          <Text className={styles.statLabel}>已完成任务</Text>
        </View>
        <View className={styles.divider} />
        <View className={styles.statItem} onClick={handleMyFavorites}>
          <Text className={styles.statNumber}>{favoriteFiles.length}</Text>
          <Text className={styles.statLabel}>收藏文件</Text>
        </View>
      </View>

      <View className={styles.taskSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>我的待办</Text>
          <Text 
            className={styles.sectionAction}
            onClick={() => Taro.switchTab({ url: '/pages/kanban/index' })}
          >
            查看全部 ›
          </Text>
        </View>

        <View className={styles.taskTabs}>
          {taskTabs.map(tab => (
            <Text
              key={tab.key}
              className={classnames(styles.tabItem, activeTaskTab === tab.key && styles.active)}
              onClick={() => setActiveTaskTab(tab.key)}
            >
              {tab.label}
            </Text>
          ))}
        </View>

        {displayedTasks.length > 0 ? (
          <View className={styles.taskList}>
            {displayedTasks.slice(0, 5).map(task => {
              const overdue = task.status !== 'done' && isOverdue(task.dueDate);
              return (
                <View 
                  key={task.id} 
                  className={styles.taskItem}
                  onClick={() => handleTaskClick(task.id)}
                >
                  <View className={styles.taskContent}>
                    <View className={styles.taskHeader}>
                      <Text className={styles.taskTitle}>{task.title}</Text>
                      <StatusTag status={task.status} priority={task.priority} />
                    </View>
                    <View className={styles.taskMeta}>
                      <Text className={styles.projectName}>{task.projectName}</Text>
                      <Text style={{ color: overdue ? '#F53F3F' : undefined }}>
                        📅 {formatDate(task.dueDate)}
                        {overdue && ' 已逾期'}
                      </Text>
                    </View>
                  </View>
                  <View 
                    className={styles.changeStatusBtn}
                    onClick={(e) => handleTaskStatusChange(task, e)}
                  >
                    <Text>⚡</Text>
                  </View>
                </View>
              );
            })}
            {displayedTasks.length > 5 && (
              <View 
                className={styles.moreTasksBtn}
                onClick={() => Taro.switchTab({ url: '/pages/kanban/index' })}
              >
                <Text>查看更多任务 ›</Text>
              </View>
            )}
          </View>
        ) : (
          <View className={styles.emptyTasks}>
            <Text className={styles.emptyIcon}>🎉</Text>
            <Text className={styles.emptyText}>
              {activeTaskTab === 'done' ? '暂无已完成任务' : 
               activeTaskTab === 'overdue' ? '暂无逾期任务，继续保持！' :
               `暂无${taskTabs.find(t => t.key === activeTaskTab)?.label}任务`}
            </Text>
          </View>
        )}
      </View>

      <View className={styles.menuSection}>
        <View className={styles.menuItem} onClick={handleWeeklyReport}>
          <View className={`${styles.menuIcon} ${styles.blue}`}>
            <Text>📊</Text>
          </View>
          <Text className={styles.menuText}>周报摘要</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={handleMyFavorites}>
          <View className={`${styles.menuIcon} ${styles.orange}`}>
            <Text>⭐</Text>
          </View>
          <Text className={styles.menuText}>我的收藏</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={handleMembers}>
          <View className={`${styles.menuIcon} ${styles.green}`}>
            <Text>👥</Text>
          </View>
          <Text className={styles.menuText}>团队成员</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      <View className={styles.menuSection}>
        <View className={styles.menuItem} onClick={handleSettings}>
          <View className={`${styles.menuIcon} ${styles.purple}`}>
            <Text>⚙️</Text>
          </View>
          <Text className={styles.menuText}>设置</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={handleHelp}>
          <View className={`${styles.menuIcon} ${styles.cyan}`}>
            <Text>❓</Text>
          </View>
          <Text className={styles.menuText}>帮助与反馈</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={handleAbout}>
          <View className={`${styles.menuIcon} ${styles.green}`}>
            <Text>ℹ️</Text>
          </View>
          <Text className={styles.menuText}>关于我们</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      <View className={styles.logoutBtn} onClick={handleLogout}>
        <Text>退出登录</Text>
      </View>
    </ScrollView>
  );
};

export default MinePage;
