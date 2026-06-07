import React, { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { meetings } from '@/data/meetings';
import { Meeting, MeetingTopic } from '@/types';
import { formatDate, formatDateTime } from '@/utils';

const MeetingDetailPage: React.FC = () => {
  const router = useRouter();
  const meetingId = router.params.id || 'meeting1';
  const meeting = meetings.find(m => m.id === meetingId) || meetings[0];

  const [currentMeeting, setCurrentMeeting] = useState<Meeting>(meeting);

  const handleGenerateTask = (topic: MeetingTopic) => {
    Taro.showModal({
      title: '生成任务',
      content: `确定要从议题「${topic.title}」生成任务吗？`,
      success: (res) => {
        if (res.confirm) {
          setCurrentMeeting(prev => ({
            ...prev,
            topics: prev.topics.map(t => 
              t.id === topic.id ? { ...t, taskGenerated: true } : t
            )
          }));
          Taro.showToast({ title: '任务已生成', icon: 'success' });
        }
      }
    });
  };

  const handleAddTopic = () => {
    Taro.showToast({ title: '添加议题', icon: 'none' });
  };

  const handleEdit = () => {
    Taro.showToast({ title: '编辑会议', icon: 'none' });
  };

  const handleStartMeeting = () => {
    Taro.showToast({ title: '开始会议', icon: 'none' });
  };

  const handleEndMeeting = () => {
    Taro.showModal({
      title: '结束会议',
      content: '确定要结束本次会议吗？',
      success: (res) => {
        if (res.confirm) {
          setCurrentMeeting(prev => ({ ...prev, status: 'finished' }));
          Taro.showToast({ title: '会议已结束', icon: 'success' });
        }
      }
    });
  };

  return (
    <View className={styles.meetingDetailPage}>
      <View className={styles.meetingHeader}>
        <Text className={styles.meetingTitle}>{currentMeeting.title}</Text>
        <View className={styles.meetingMeta}>
          <View className={styles.metaRow}>
            <Text className={styles.metaIcon}>⏰</Text>
            <Text>
              {formatDateTime(currentMeeting.startTime)} - {formatDate(currentMeeting.endTime, 'HH:mm')}
            </Text>
          </View>
          <View className={styles.metaRow}>
            <Text className={styles.metaIcon}>📍</Text>
            <Text>{currentMeeting.location}</Text>
          </View>
          <View className={styles.metaRow}>
            <Text className={styles.metaIcon}>📁</Text>
            <Text>{currentMeeting.projectName}</Text>
          </View>
          <View className={styles.metaRow}>
            <Text className={styles.metaIcon}>👤</Text>
            <Text>{currentMeeting.organizerName} 组织</Text>
          </View>
        </View>
      </View>

      <ScrollView className={styles.content} scrollY>
        <View className={`${styles.section} ${styles.attendees}`}>
          <Text className={styles.sectionTitle}>
            参会人员 ({currentMeeting.attendees.length})
          </Text>
          <View className={styles.attendeeList}>
            {currentMeeting.attendees.slice(0, 6).map(attendee => (
              <View key={attendee.id} className={styles.attendeeItem}>
                <View className={styles.avatar}>
                  <Image src={attendee.avatar} mode="aspectFill" />
                </View>
                <Text className={styles.name}>{attendee.name}</Text>
              </View>
            ))}
            {currentMeeting.attendees.length > 6 && (
              <View className={styles.addAttendee}>
                <Text>+{currentMeeting.attendees.length - 6}</Text>
              </View>
            )}
          </View>
        </View>

        <View className={`${styles.section} ${styles.topics}`}>
          <View className={styles.sectionTitle}>
            <Text>议题列表</Text>
            {currentMeeting.status !== 'finished' && (
              <Text className={styles.sectionAction} onClick={handleAddTopic}>添加</Text>
            )}
          </View>
          <View className={styles.topicList}>
            {currentMeeting.topics.map((topic, index) => (
              <View key={topic.id} className={styles.topicItem}>
                <View className={styles.topicHeader}>
                  <View className={styles.topicIndex}>{index + 1}</View>
                  <Text className={styles.topicTitle}>{topic.title}</Text>
                  {topic.taskGenerated && (
                    <View className={styles.topicTag}>已生成任务</View>
                  )}
                </View>
                
                {topic.conclusion && (
                  <View className={styles.topicConclusion}>
                    <Text className={styles.conclusionLabel}>结论</Text>
                    <Text className={styles.conclusionText}>{topic.conclusion}</Text>
                    {!topic.taskGenerated && currentMeeting.status === 'finished' && (
                      <Text 
                        className={styles.generateTaskBtn}
                        onClick={() => handleGenerateTask(topic)}
                      >
                        ➕ 生成任务
                      </Text>
                    )}
                    {topic.taskGenerated && (
                      <View className={styles.taskGenerated}>
                        <Text className={styles.checkIcon}>✅</Text>
                        <Text>已生成对应任务</Text>
                      </View>
                    )}
                  </View>
                )}

                {topic.assignee && (
                  <View className={styles.topicAssignee}>
                    <Image 
                      className={styles.avatar} 
                      src={currentMeeting.attendees.find(a => a.id === topic.assignee)?.avatar || ''} 
                      mode="aspectFill" 
                    />
                    <Text>负责人：{currentMeeting.attendees.find(a => a.id === topic.assignee)?.name || ''}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
          {currentMeeting.status !== 'finished' && (
            <View className={styles.addTopicBtn} onClick={handleAddTopic}>
              ➕ 添加议题
            </View>
          )}
        </View>

        {currentMeeting.notes && (
          <View className={`${styles.section} ${styles.notes}`}>
            <Text className={styles.sectionTitle}>会议纪要</Text>
            <Text className={styles.notesText}>{currentMeeting.notes}</Text>
          </View>
        )}

        {currentMeeting.attachments.length > 0 && (
          <View className={`${styles.section} ${styles.attachments}`}>
            <Text className={styles.sectionTitle}>会议附件</Text>
            {currentMeeting.attachments.map(file => (
              <View key={file.id} className={styles.attachmentItem}>
                <View className={styles.fileIcon}>
                  <Text>📄</Text>
                </View>
                <View className={styles.fileInfo}>
                  <Text className={styles.fileName}>{file.name}</Text>
                  <Text className={styles.fileSize}>{file.size}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={`${styles.btn} ${styles.secondary}`} onClick={handleEdit}>
          <Text>编辑</Text>
        </View>
        {currentMeeting.status === 'upcoming' ? (
          <View className={`${styles.btn} ${styles.primary}`} onClick={handleStartMeeting}>
            <Text>开始会议</Text>
          </View>
        ) : currentMeeting.status === 'ongoing' ? (
          <View className={`${styles.btn} ${styles.primary}`} onClick={handleEndMeeting}>
            <Text>结束会议</Text>
          </View>
        ) : (
          <View className={`${styles.btn} ${styles.primary}`} onClick={() => Taro.showToast({ title: '查看纪要', icon: 'none' })}>
            <Text>查看纪要</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default MeetingDetailPage;
