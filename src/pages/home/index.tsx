import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import ProjectCard from '@/components/ProjectCard';
import { projects } from '@/data/projects';
import { tasks, getMyTasks } from '@/data/tasks';
import { currentUserId } from '@/data/members';
import { members } from '@/data/members';

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('active');

  const currentUser = members.find(m => m.id === currentUserId);
  const myTasks = getMyTasks(currentUserId);

  const todoCount = myTasks.filter(t => t.status === 'todo').length;
  const inProgressCount = myTasks.filter(t => t.status === 'in_progress').length;
  const overdueCount = myTasks.filter(t => t.status !== 'done' && new Date(t.dueDate) < new Date()).length;

  const filteredProjects = useMemo(() => {
    if (activeTab === 'all') return projects;
    return projects.filter(p => p.status === activeTab);
  }, [activeTab]);

  const handleSearch = () => {
    Taro.navigateTo({ url: '/pages/search/index' });
  };

  const handleCreateProject = () => {
    Taro.navigateTo({ url: '/pages/create-project/index' });
  };

  const handleCreateMeeting = () => {
    Taro.showToast({ title: '创建会议', icon: 'none' });
  };

  const handleCreateTask = () => {
    Taro.showToast({ title: '创建任务', icon: 'none' });
  };

  const handleFiles = () => {
    if (projects.length > 0) {
      Taro.navigateTo({ url: `/pages/files/index?projectId=${projects[0].id}` });
    }
  };

  const handleViewAllTasks = () => {
    Taro.switchTab({ url: '/pages/kanban/index' });
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
    <ScrollView className={styles.homePage} scrollY>
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <View className={styles.greeting}>
            <Text className={styles.hello}>早上好，</Text>
            <View className={styles.userName}>{currentUser?.name || '用户'}</View>
          </View>
          <View className={styles.userAvatar}>
            <Image src={currentUser?.avatar || 'https://picsum.photos/id/64/200/200'} mode="aspectFill" />
          </View>
        </View>

        <View className={styles.searchBar} onClick={handleSearch}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Text className={styles.searchText}>搜索项目、任务、会议...</Text>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.quickActions}>
          <View className={styles.actionItem} onClick={handleCreateProject}>
            <View className={`${styles.actionIcon} ${styles.create}`}>
              <Text>➕</Text>
            </View>
            <Text className={styles.actionLabel}>创建项目</Text>
          </View>
          <View className={styles.actionItem} onClick={handleCreateMeeting}>
            <View className={`${styles.actionIcon} ${styles.meeting}`}>
              <Text>📅</Text>
            </View>
            <Text className={styles.actionLabel}>安排会议</Text>
          </View>
          <View className={styles.actionItem} onClick={handleCreateTask}>
            <View className={`${styles.actionIcon} ${styles.task}`}>
              <Text>✅</Text>
            </View>
            <Text className={styles.actionLabel}>新建任务</Text>
          </View>
          <View className={styles.actionItem} onClick={handleFiles}>
            <View className={`${styles.actionIcon} ${styles.file}`}>
              <Text>📁</Text>
            </View>
            <Text className={styles.actionLabel}>文件区</Text>
          </View>
        </View>

        <View className={styles.todoOverview}>
          <View className={styles.sectionTitle}>
            <Text>我的待办</Text>
            <Text className={styles.viewAll} onClick={handleViewAllTasks}>查看全部</Text>
          </View>
          <View className={styles.statsRow}>
            <View className={`${styles.statCard} ${styles.todo}`}>
              <Text className={styles.statNumber}>{todoCount}</Text>
              <Text className={styles.statLabel}>待开始</Text>
            </View>
            <View className={`${styles.statCard} ${styles.inProgress}`}>
              <Text className={styles.statNumber}>{inProgressCount}</Text>
              <Text className={styles.statLabel}>进行中</Text>
            </View>
            <View className={`${styles.statCard} ${styles.overdue}`}>
              <Text className={styles.statNumber}>{overdueCount}</Text>
              <Text className={styles.statLabel}>已逾期</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>项目</Text>
            <Text className={styles.sectionMore}>共 {projects.length} 个</Text>
          </View>

          <View className={styles.tabs}>
            <Text 
              className={`${styles.tab} ${activeTab === 'active' ? styles.active : ''}`}
              onClick={() => setActiveTab('active')}
            >
              进行中
            </Text>
            <Text 
              className={`${styles.tab} ${activeTab === 'paused' ? styles.active : ''}`}
              onClick={() => setActiveTab('paused')}
            >
              已暂停
            </Text>
            <Text 
              className={`${styles.tab} ${activeTab === 'archived' ? styles.active : ''}`}
              onClick={() => setActiveTab('archived')}
            >
              已归档
            </Text>
          </View>

          {filteredProjects.length > 0 ? (
            filteredProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📂</Text>
              <Text className={styles.emptyText}>暂无项目</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;
