import React from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useAppStore';
import { MeetingTopic } from '@/types';
import { formatDate, formatDateTime } from '@/utils';

const MeetingDetailPage: React.FC = () => {
  const router = useRouter();
  const meetingId = router.params.id || 'meeting1';
  
  const meeting = useAppStore(state => state.getMeetingById(meetingId));
  const updateMeetingStatus = useAppStore(state => state.updateMeetingStatus);
  const updateMeetingTopic = useAppStore(state => state.updateMeetingTopic);
  const addTask = useAppStore(state => state.addTask);
  const currentUserId = useAppStore(state => state.currentUserId);
  const getCurrentUser = useAppStore(state => state.getCurrentUser);

  const currentUser = getCurrentUser();

  if (!meeting) {
    return (
      <View className={styles.meetingDetailPage}>
        <View style={{ padding: '100rpx', textAlign: 'center' }}>
          <Text>会议不存在</Text>
        </View>
      </View>
    );
  }

  const handleGenerateTask = (topic: MeetingTopic) => {
    Taro.showModal({
      title: '生成任务',
      content: `确定要从议题「${topic.title}」生成任务吗？`,
      success: (res) => {
        if (res.confirm) {
          addTask({
            title: topic.title,
            description: topic.conclusion || '',
            status: 'todo',
            priority: 'medium',
            projectId: meeting.projectId,
            projectName: meeting.projectName,
            assigneeId: topic.assignee || currentUserId,
            assigneeName: topic.assignee 
              ? meeting.attendees.find(a => a.id === topic.assignee)?.name || currentUser?.name || ''
              : currentUser?.name || '',
            assigneeAvatar: topic.assignee 
              ? meeting.attendees.find(a => a.id === topic.assignee)?.avatar || ''
              : currentUser?.avatar || '',
            creatorId: currentUserId,
            creatorName: currentUser?.name || '',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          });
          
          updateMeetingTopic(meeting.id, topic.id, { taskGenerated: true });
          Taro.showToast({ title: '任务已生成', icon: 'success' });
        }
      }
    });
  };

  const handleAddTopic = () => {
    Taro.showToast({ title: '添加议题功能开发中', icon: 'none' });
  };

  const handleEdit = () => {
    Taro.showToast({ title: '编辑会议功能开发中', icon: 'none' });
  };

  const handleStartMeeting = () => {
    updateMeetingStatus(meeting.id, 'ongoing');
    Taro.showToast({ title: '会议已开始', icon: 'success' });
  };

  const handleEndMeeting = () => {
    Taro.showModal({
      title: '结束会议',
      content: '确定要结束本次会议吗？',
      success: (res) => {
        if (res.confirm) {
          updateMeetingStatus(meeting.id, 'finished');
          Taro.showToast({ title: '会议已结束', icon: 'success' });
        }
      }
    });
  };

  return (
    <View className={styles.meetingDetailPage}>
      <View className={styles.meetingHeader}>
        <Text className={styles.meetingTitle}>{meeting.title}</Text>
        <View className={styles.meetingMeta}>
          <View className={styles.metaRow}>
            <Text className={styles.metaIcon}>⏰</Text>
            <Text>
              {formatDateTime(meeting.startTime)} - {formatDate(meeting.endTime, 'HH:mm')}
            </Text>
          </View>
          <View className={styles.metaRow}>
            <Text className={styles.metaIcon}>📍</Text>
            <Text>{meeting.location}</Text>
          </View>
          <View className={styles.metaRow}>
            <Text className={styles.metaIcon}>📁</Text>
            <Text>{meeting.projectName}</Text>
          </View>
          <View className={styles.metaRow}>
            <Text className={styles.metaIcon}>👤</Text>
            <Text>{meeting.organizerName} 组织</Text>
          </View>
        </View>
      </View>

      <ScrollView className={styles.content} scrollY>
        <View className={`${styles.section} ${styles.attendees}`}>
          <Text className={styles.sectionTitle}>
            参会人员 ({meeting.attendees.length})
          </Text>
          <View className={styles.attendeeList}>
            {meeting.attendees.slice(0, 6).map(attendee => (
              <View key={attendee.id} className={styles.attendeeItem}>
                <View className={styles.avatar}>
                  <Image src={attendee.avatar} mode="aspectFill" />
                </View>
                <Text className={styles.name}>{attendee.name}</Text>
              </View>
            ))}
            {meeting.attendees.length > 6 && (
              <View className={styles.addAttendee}>
                <Text>+{meeting.attendees.length - 6}</Text>
              </View>
            )}
          </View>
        </View>

        <View className={`${styles.section} ${styles.topics}`}>
          <View className={styles.sectionTitle}>
            <Text>议题列表</Text>
            {meeting.status !== 'finished' && (
              <Text className={styles.sectionAction} onClick={handleAddTopic}>添加</Text>
            )}
          </View>
          <View className={styles.topicList}>
            {meeting.topics.map((topic, index) => (
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
                    {!topic.taskGenerated && meeting.status === 'finished' && (
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
                      src={meeting.attendees.find(a => a.id === topic.assignee)?.avatar || ''} 
                      mode="aspectFill" 
                    />
                    <Text>负责人：{meeting.attendees.find(a => a.id === topic.assignee)?.name || ''}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
          {meeting.status !== 'finished' && (
            <View className={styles.addTopicBtn} onClick={handleAddTopic}>
              ➕ 添加议题
            </View>
          )}
        </View>

        {meeting.notes && (
          <View className={`${styles.section} ${styles.notes}`}>
            <Text className={styles.sectionTitle}>会议纪要</Text>
            <Text className={styles.notesText}>{meeting.notes}</Text>
          </View>
        )}

        {meeting.attachments.length > 0 && (
          <View className={`${styles.section} ${styles.attachments}`}>
            <Text className={styles.sectionTitle}>会议附件</Text>
            {meeting.attachments.map(file => (
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
        {meeting.status === 'upcoming' ? (
          <View className={`${styles.btn} ${styles.primary}`} onClick={handleStartMeeting}>
            <Text>开始会议</Text>
          </View>
        ) : meeting.status === 'ongoing' ? (
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
