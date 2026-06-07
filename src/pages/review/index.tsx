import React, { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { projects } from '@/data/projects';
import { tasks } from '@/data/tasks';
import { meetings } from '@/data/meetings';
import { members } from '@/data/members';
import { formatDate } from '@/utils';

type TabType = 'weekly' | 'project';

const ReviewPage: React.FC = () => {
  const router = useRouter();
  const projectId = router.params.projectId;
  
  const [activeTab, setActiveTab] = useState<TabType>('weekly');

  const weekStart = formatDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), 'MM月DD日');
  const weekEnd = formatDate(new Date().toISOString(), 'MM月DD日');

  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  const weekMeetings = meetings.filter(m => m.status === 'finished').length;

  const projectReviews = projects.filter(p => p.status === 'archived' || p.status === 'active').slice(0, 3);

  const highlights = [
    '电商平台重构项目进度超预期',
    '移动端App设计方案通过评审',
    '新增智能客服系统项目',
    '团队协作效率提升20%'
  ];

  const nextWeekPlans = [
    '继续推进电商平台核心功能开发',
    '启动移动端App开发',
    '完善数据分析平台需求'
  ];

  const handleGenerateReport = () => {
    Taro.showLoading({ title: '生成中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({ title: '周报已生成', icon: 'success' });
    }, 1500);
  };

  const handleViewDetail = () => {
    Taro.showToast({ title: '查看周报详情', icon: 'none' });
  };

  const handleReviewClick = (projectId: string) => {
    Taro.navigateTo({ url: `/pages/project-detail/index?id=${projectId}` });
  };

  return (
    <View className={styles.reviewPage}>
      <View className={styles.tabBar}>
        <Text
          className={classnames(styles.tabItem, activeTab === 'weekly' && styles.active)}
          onClick={() => setActiveTab('weekly')}
        >
          周报摘要
        </Text>
        <Text
          className={classnames(styles.tabItem, activeTab === 'project' && styles.active)}
          onClick={() => setActiveTab('project')}
        >
          项目复盘
        </Text>
      </View>

      <ScrollView scrollY className={styles.content}>
        {activeTab === 'weekly' ? (
          <>
            <View className={styles.weeklyCard}>
              <View className={styles.cardHeader}>
                <Text className={styles.title}>本周工作概览</Text>
                <Text className={styles.date}>{weekStart} - {weekEnd}</Text>
              </View>
              <View className={styles.statsRow}>
                <View className={styles.statItem}>
                  <Text className={styles.statNumber}>{completedTasks}</Text>
                  <Text className={styles.statLabel}>完成任务</Text>
                </View>
                <View className={styles.statItem}>
                  <Text className={styles.statNumber}>{weekMeetings}</Text>
                  <Text className={styles.statLabel}>参加会议</Text>
                </View>
                <View className={styles.statItem}>
                  <Text className={styles.statNumber}>{Math.round(completedTasks / totalTasks * 100)}%</Text>
                  <Text className={styles.statLabel}>完成率</Text>
                </View>
              </View>
              <View className={styles.viewDetail} onClick={handleViewDetail}>
                查看详情 ›
              </View>
            </View>

            <View className={styles.section}>
              <View className={styles.sectionHeader}>
                <Text className={styles.sectionTitle}>本周亮点</Text>
              </View>
              <View className={styles.summaryCard}>
                <View className={styles.summaryTags}>
                  {highlights.map((item, index) => (
                    <View key={index} className={styles.tag}>
                      <Text>✨ {item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View className={styles.section}>
              <View className={styles.sectionHeader}>
                <Text className={styles.sectionTitle}>下周计划</Text>
              </View>
              <View className={styles.summaryCard}>
                <View className={styles.summaryContent}>
                  {nextWeekPlans.map((item, index) => (
                    <Text key={index} style={{ display: 'block', marginBottom: '8rpx' }}>
                      • {item}
                    </Text>
                  ))}
                </View>
              </View>
            </View>

            <View className={styles.generateBtn} onClick={handleGenerateReport}>
              <Text className={styles.btnIcon}>📄</Text>
              <Text>生成周报</Text>
            </View>
          </>
        ) : (
          <View className={styles.reviewList}>
            {projectReviews.length > 0 ? (
              projectReviews.map(project => (
                <View 
                  key={project.id} 
                  className={styles.reviewItem}
                  onClick={() => handleReviewClick(project.id)}
                >
                  <View className={styles.reviewIcon}>
                    <Text>📊</Text>
                  </View>
                  <View className={styles.reviewInfo}>
                    <Text className={styles.reviewTitle}>{project.name}</Text>
                    <Text className={styles.reviewProject}>
                      {project.status === 'archived' ? '已归档' : '进行中'} · {project.memberCount}名成员
                    </Text>
                  </View>
                  <Text className={styles.reviewArrow}>›</Text>
                </View>
              ))
            ) : (
              <View className={styles.emptyState}>
                <Text className={styles.emptyIcon}>📊</Text>
                <Text className={styles.emptyText}>暂无复盘项目</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ReviewPage;
