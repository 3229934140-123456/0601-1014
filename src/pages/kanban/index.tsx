import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import TaskCard from '@/components/TaskCard';
import { tasks } from '@/data/tasks';
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
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

  const getTasksByStatus = (status: TaskStatus): Task[] => {
    let filtered = localTasks.filter(t => t.status === status);
    if (filterProject !== 'all') {
      filtered = filtered.filter(t => t.projectId === filterProject);
    }
    return filtered;
  };

  const handleAddTask = () => {
    Taro.showToast({ title: '创建任务', icon: 'none' });
  };

  const handleTaskClick = (taskId: string) => {
    Taro.navigateTo({
      url: `/pages/task-detail/index?id=${taskId}`
    });
  };

  const handleFilterProject = () => {
    Taro.showActionSheet({
      itemList: ['全部项目', '电商平台重构', '移动端App', '数据分析平台'],
      success: (res) => {
        const projectIds = ['all', 'p1', 'p2', 'p3'];
        setFilterProject(projectIds[res.tapIndex]);
      }
    });
  };

  const handlePullDownRefresh = () => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
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
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        onClick={() => handleTaskClick(task.id)}
                      />
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
