import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { Task } from '@/types';
import { formatDate, isOverdue, isDueSoon } from '@/utils';

interface TaskCardProps {
  task: Task;
  compact?: boolean;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, compact = false, onClick }) => {
  const overdue = isOverdue(task.dueDate) && task.status !== 'done';
  const dueSoon = isDueSoon(task.dueDate) && task.status !== 'done';

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/task-detail/index?id=${task.id}`
      });
    }
  };

  if (compact) {
    return (
      <View className={styles.compactTaskCard} onClick={handleClick}>
        <Text className={styles.taskTitle}>{task.title}</Text>
        <View className={styles.taskInfo}>
          <Image className={styles.avatar} src={task.assigneeAvatar} mode="aspectFill" />
          <Text className={classnames(styles.dueDate, {
            [styles.overdue]: overdue,
            [styles.dueSoon]: dueSoon && !overdue
          })}>
            {formatDate(task.dueDate, 'MM-DD')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.taskCard} onClick={handleClick}>
      <View className={styles.taskHeader}>
        <Text className={styles.taskTitle}>{task.title}</Text>
        <View className={classnames(styles.priorityDot, styles[task.priority])} />
      </View>

      <Text className={styles.taskProject}>{task.projectName}</Text>

      <View className={styles.taskFooter}>
        <View className={styles.assignee}>
          <Image className={styles.avatar} src={task.assigneeAvatar} mode="aspectFill" />
          <Text className={styles.name}>{task.assigneeName}</Text>
        </View>
        <Text className={classnames(styles.dueDate, {
          [styles.overdue]: overdue,
          [styles.dueSoon]: dueSoon && !overdue,
          [styles.normal]: !overdue && !dueSoon
        })}>
          {formatDate(task.dueDate, 'MM-DD')}
        </Text>
      </View>

      {(task.comments.length > 0 || task.attachments.length > 0) && (
        <View className={styles.taskMeta}>
          {task.comments.length > 0 && (
            <View className={styles.metaItem}>
              <Text className={styles.metaIcon}>💬</Text>
              <Text>{task.comments.length}</Text>
            </View>
          )}
          {task.attachments.length > 0 && (
            <View className={styles.metaItem}>
              <Text className={styles.metaIcon}>📎</Text>
              <Text>{task.attachments.length}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default TaskCard;
