import React from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useAppStore';
import StatusTag from '@/components/StatusTag';
import { formatDate } from '@/utils';

const ProjectDetailPage: React.FC = () => {
  const router = useRouter();
  const projectId = router.params.id || 'p1';
  
  const project = useAppStore(state => state.getProjectById(projectId));
  const updateProjectStatus = useAppStore(state => state.updateProjectStatus);

  if (!project) {
    return (
      <View className={styles.projectDetailPage}>
        <View style={{ padding: '100rpx', textAlign: 'center' }}>
          <Text>项目不存在</Text>
        </View>
      </View>
    );
  }

  const progress = project.taskCount > 0 
    ? Math.round((project.completedTaskCount / project.taskCount) * 100) 
    : 0;

  const handleFiles = () => {
    Taro.navigateTo({ url: `/pages/files/index?projectId=${project.id}` });
  };

  const handleMembers = () => {
    Taro.navigateTo({ url: `/pages/members/index?projectId=${project.id}` });
  };

  const handleReview = () => {
    Taro.navigateTo({ url: `/pages/review/index?projectId=${project.id}` });
  };

  const handleCreateMeeting = () => {
    Taro.navigateTo({ url: `/pages/create-meeting/index?projectId=${project.id}` });
  };

  const handleArchive = () => {
    const isArchived = project.status === 'archived';
    Taro.showModal({
      title: '提示',
      content: isArchived ? '确定要激活此项目吗？' : '确定要归档此项目吗？',
      success: (res) => {
        if (res.confirm) {
          const newStatus = isArchived ? 'active' : 'archived';
          updateProjectStatus(project.id, newStatus);
          Taro.showToast({ 
            title: isArchived ? '已激活' : '已归档', 
            icon: 'success' 
          });
        }
      }
    });
  };

  const handleAddMember = () => {
    Taro.showToast({ title: '邀请成员功能开发中', icon: 'none' });
  };

  return (
    <View className={styles.projectDetailPage}>
      <View className={styles.projectHeader}>
        <Text className={styles.projectName}>{project.name}</Text>
        <Text className={styles.projectDesc}>{project.description}</Text>
        <View className={styles.projectMeta}>
          <View className={styles.metaItem}>
            <Text className={styles.metaIcon}>📅</Text>
            <Text>开始 {formatDate(project.createdAt)}</Text>
          </View>
          {project.endDate && (
            <View className={styles.metaItem}>
              <Text className={styles.metaIcon}>🎯</Text>
              <Text>截止 {formatDate(project.endDate)}</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView className={styles.content} scrollY>
        <View className={styles.statsCard}>
          <View className={styles.progressSection}>
            <View className={styles.progressHeader}>
              <Text className={styles.progressLabel}>项目进度</Text>
              <Text className={styles.progressPercent}>{progress}%</Text>
            </View>
            <View className={styles.progressBar}>
              <View className={styles.progressFill} style={{ width: `${progress}%` }} />
            </View>
          </View>
          <View className={styles.statsGrid}>
            <View className={styles.statItem}>
              <Text className={styles.statNumber}>{project.taskCount}</Text>
              <Text className={styles.statLabel}>总任务</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNumber}>{project.completedTaskCount}</Text>
              <Text className={styles.statLabel}>已完成</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNumber}>{project.meetingCount}</Text>
              <Text className={styles.statLabel}>会议</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNumber}>{project.fileCount}</Text>
              <Text className={styles.statLabel}>文件</Text>
            </View>
          </View>
        </View>

        <View className={styles.quickActions}>
          <Text className={styles.sectionTitle}>快捷入口</Text>
          <View className={styles.actionsGrid}>
            <View className={styles.actionItem} onClick={handleFiles}>
              <View className={`${styles.actionIcon} ${styles.files}`}>
                <Text>📁</Text>
              </View>
              <Text className={styles.actionLabel}>文件区</Text>
            </View>
            <View className={styles.actionItem} onClick={handleMembers}>
              <View className={`${styles.actionIcon} ${styles.members}`}>
                <Text>👥</Text>
              </View>
              <Text className={styles.actionLabel}>成员</Text>
            </View>
            <View className={styles.actionItem} onClick={handleReview}>
              <View className={`${styles.actionIcon} ${styles.review}`}>
                <Text>📊</Text>
              </View>
              <Text className={styles.actionLabel}>复盘</Text>
            </View>
            <View className={styles.actionItem} onClick={handleCreateMeeting}>
              <View className={`${styles.actionIcon} ${styles.meeting}`}>
                <Text>📅</Text>
              </View>
              <Text className={styles.actionLabel}>会议</Text>
            </View>
          </View>
        </View>

        <View className={styles.membersSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>项目成员 ({project.memberCount})</Text>
            <Text className={styles.viewAll} onClick={handleMembers}>查看全部</Text>
          </View>
          <View className={styles.membersGrid}>
            {project.members.slice(0, 5).map(member => (
              <View key={member.id} className={styles.memberItem}>
                <View className={styles.avatar}>
                  <Image src={member.avatar} mode="aspectFill" />
                </View>
                <Text className={styles.name}>{member.name}</Text>
              </View>
            ))}
            {project.members.length > 5 && (
              <View className={styles.memberItem} onClick={handleAddMember}>
                <View className={styles.avatar} style={{ backgroundColor: '#f2f3f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: '32rpx', color: '#86909c' }}>+</Text>
                </View>
                <Text className={styles.name}>添加</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={`${styles.btn} ${styles.secondary}`} onClick={handleArchive}>
          <Text>{project.status === 'archived' ? '激活项目' : '归档项目'}</Text>
        </View>
        <View className={`${styles.btn} ${styles.primary}`} onClick={handleCreateMeeting}>
          <Text>安排会议</Text>
        </View>
      </View>
    </View>
  );
};

export default ProjectDetailPage;
