import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import TaskCard from '@/components/TaskCard';
import { useAppStore } from '@/store/useAppStore';
import { TaskStatus, Task } from '@/types';

interface KanbanColumn {
  key: TaskStatus;
  title: string;
  color: string;
}

const columns: KanbanColumn[] = [
  { key: 'todo', title: '待开始', color: '#86909C' },
  { key: 'in_progress', title: '进行中', color: '#2F6BFF' },
  { key: 'review', title: '待审核', color: '#FF7D00' },
  { key: 'done', title: '已完成', color: '#00B42A' }
];

const KanbanPage: React.FC = () => {
  const [filterProject, setFilterProject] = useState<string>('all');

  const tasks = useAppStore(state => state.tasks);
  const projects = useAppStore(state => state.projects);
  const updateTaskStatus = useAppStore(state => state.updateTaskStatus);

  const getTasksByStatus = (status: TaskStatus): Task[] => {
    let filtered = tasks.filter(t => t.status === status);
    if (filterProject !== 'all') {
      filtered = filtered.filter(t => t.projectId === filterProject);
    }
    return filtered;
  };

  const handleAddTask = () => {
    Taro.navigateTo({ url: '/pages/create-task/index' });
  };

  const handleTaskClick = (taskId: string) => {
    Taro.navigateTo({
      url: `/pages/task-detail/index?id=${taskId}`
    });
  };

  const handleStatusChange = (taskId: string, taskTitle: string, currentStatus: TaskStatus) => {
    const statusLabels = ['待开始', '进行中', '待审核', '已完成'];
    const statusKeys: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];
    
    Taro.showActionSheet({
      itemList: statusLabels.map((label, index) => 
        statusKeys[index] === currentStatus ? `${label} (当前)` : label
      ),
      success: (res) => {
        const newStatus = statusKeys[res.tapIndex];
        if (newStatus !== currentStatus) {
          if (newStatus === 'done') {
            Taro.showModal({
              title: '完成任务',
              content: `确定要将「${taskTitle}」标记为已完成吗？`,
              success: (modalRes) => {
                if (modalRes.confirm) {
                  updateTaskStatus(taskId, 'done', '任务已完成');
                  Taro.showToast({ title: '已更新状态', icon: 'success' });
                }
              }
            });
          } else {
            updateTaskStatus(taskId, newStatus);
            Taro.showToast({ title: '已更新状态', icon: 'success' });
          }
        }
      }
    });
  };

  const handleFilterProject = () => {
    const projectNames = ['全部项目', ...projects.map(p => p.name)];
    Taro.showActionSheet({
      itemList: projectNames,
      success: (res) => {
        const projectIds = ['all', ...projects.map(p => p.id)];
        setFilterProject(projectIds[res.tapIndex]);
      }
    });
  };

  const handlePullDownRefresh = () => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  };

  React.useEffect(() => {
    Taro.onPullDownRefresh(handlePullDownRefresh);
    return () => {
      Taro.offPullDownRefresh(handlePullDownRefresh);
    };
  }, []);

  return (
    <View className={styles.kanbanPage}>
      <View className={styles.filterBar}>
        <View 
          className={`${styles.filterItem} ${filterProject !== 'all' ? styles.active : ''}`}
          onClick={handleFilterProject}
        >
          <Text className={styles.filterIcon}>📁</Text>
          <Text>项目筛选</Text>
        </View>
        <View className={styles.filterItem}>
          <Text className={styles.filterIcon}>👤</Text>
          <Text>负责人</Text>
        </View>
        <Text className={styles.searchBtn} onClick={() => Taro.navigateTo({ url: '/pages/search/index' })}>🔍</Text>
      </View>

      <ScrollView 
        className={styles.kanbanContainer}
        scrollX
        enhanced
        showScrollbar={false}
      >
        <View className={styles.kanbanScroll}>
          {columns.map(column => {
            const columnTasks = getTasksByStatus(column.key);
            return (
              <View key={column.key} className={styles.kanbanColumn}>
                <View className={styles.columnHeader}>
                  <View className={styles.columnTitle}>
                    <Text>{column.title}</Text>
                    <Text className={styles.countBadge}>{columnTasks.length}</Text>
                  </View>
                  <Text className={styles.addBtn} onClick={handleAddTask}>➕</Text>
                </View>
                <View className={styles.columnBody}>
                  {columnTasks.length > 0 ? (
                    columnTasks.map(task => (
                      <View key={task.id} className={styles.taskCardWrapper}>
                        <TaskCard 
                          task={task} 
                          onClick={() => handleTaskClick(task.id)}
                        />
                        <View 
                          className={styles.statusChangeBtn}
                          onClick={(e) => {
                            e.stopPropagation?.();
                            handleStatusChange(task.id, task.title, task.status);
                          }}
                        >
                          <Text className={styles.statusChangeIcon}>⚡</Text>
                          <Text className={styles.statusChangeText}>改状态</Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <View className={styles.emptyColumn}>
                      <Text className={styles.emptyIcon}>📋</Text>
                      <Text className={styles.emptyText}>暂无任务</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View className={styles.fabButton} onClick={handleAddTask}>
        <Text className={styles.fabIcon}>➕</Text>
      </View>
    </View>
  );
};

export default KanbanPage;
