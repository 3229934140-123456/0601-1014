import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { Meeting } from '@/types';
import StatusTag from '../StatusTag';
import { AvatarGroup } from '../MemberAvatar';
import { formatDate, formatDateTime } from '@/utils';

interface MeetingCardProps {
  meeting: Meeting;
  onClick?: () => void;
}

const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/meeting-detail/index?id=${meeting.id}`
      });
    }
  };

  const firstTopic = meeting.topics[0];

  return (
    <View className={styles.meetingCard} onClick={handleClick}>
      <View className={styles.cardHeader}>
        <Text className={styles.meetingTitle}>{meeting.title}</Text>
        <StatusTag status={meeting.status} type="meeting" />
      </View>

      <View className={styles.meetingInfo}>
        <View className={styles.infoRow}>
          <Text className={styles.infoIcon}>⏰</Text>
          <Text className={styles.infoText}>
            {formatDateTime(meeting.startTime)} - {formatDate(meeting.endTime, 'HH:mm')}
          </Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoIcon}>📍</Text>
          <Text className={styles.infoText}>{meeting.location}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoIcon}>📁</Text>
          <Text className={styles.infoText}>{meeting.projectName}</Text>
        </View>
      </View>

      {firstTopic && meeting.status === 'finished' && (
        <View className={styles.topicPreview}>
          <View className={styles.topicTitle}>
            <Text className={styles.dot} />
            <Text>{firstTopic.title}</Text>
          </View>
          {firstTopic.conclusion && (
            <Text className={styles.topicText}>{firstTopic.conclusion}</Text>
          )}
        </View>
      )}

      <View className={styles.divider} />

      <View className={styles.cardFooter}>
        <View className={styles.organizer}>
          <Image className={styles.avatar} src={meeting.attendees[0]?.avatar || ''} mode="aspectFill" />
          <Text>{meeting.organizerName} 组织</Text>
        </View>
        <AvatarGroup members={meeting.attendees} max={3} />
      </View>
    </View>
  );
};

export default MeetingCard;
