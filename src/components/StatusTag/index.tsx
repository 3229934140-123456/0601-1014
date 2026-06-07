import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface StatusTagProps {
  status: string;
  type?: 'task' | 'meeting' | 'project' | 'priority';
}

const StatusTag: React.FC<StatusTagProps> = ({ status, type = 'task' }) => {
  const statusMap: Record<string, string> = {
    todo: '待开始',
    in_progress: '进行中',
    review: '待审核',
    done: '已完成',
    upcoming: '即将开始',
    ongoing: '进行中',
    finished: '已结束',
    active: '进行中',
    archived: '已归档',
    paused: '已暂停',
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  };

  const statusClass = status.replace(/_/g, '');

  return (
    <View className={classnames(styles.statusTag, styles[statusClass])}>
      <Text>{statusMap[status] || status}</Text>
    </View>
  );
};

export default StatusTag;
