import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { Project } from '@/types';
import { AvatarGroup } from '../MemberAvatar';
import StatusTag from '../StatusTag';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const progress = project.taskCount > 0 
    ? Math.round((project.completedTaskCount / project.taskCount) * 100) 
    : 0;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/project-detail/index?id=${project.id}`
      });
    }
  };

  return (
    <View className={styles.projectCard} onClick={handleClick}>
      <View className={styles.cardHeader}>
        <View className={styles.colorDot} style={{ backgroundColor: project.coverColor }} />
        <Text className={styles.projectName}>{project.name}</Text>
        <StatusTag status={project.status} type="project" />
      </View>

      <Text className={styles.description}>{project.description}</Text>

      <View className={styles.stats}>
        <View className={styles.statItem}>
          <Text className={styles.statNumber}>{project.taskCount}</Text>
          <Text className={styles.statLabel}>任务</Text>
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

      <View className={styles.progressBar}>
        <View 
          className={styles.progressFill} 
          style={{ width: `${progress}%`, backgroundColor: project.coverColor }}
        />
      </View>

      <View className={styles.cardFooter}>
        <View className={styles.memberSection}>
          <AvatarGroup members={project.members} max={4} />
          <Text className={styles.memberCount}>{project.memberCount}人</Text>
        </View>
      </View>
    </View>
  );
};

export default ProjectCard;
