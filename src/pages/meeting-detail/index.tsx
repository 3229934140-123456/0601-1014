import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Textarea, Picker, Input } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useAppStore';
import { MeetingTopic, MeetingStatus } from '@/types';
import { formatDate, formatDateTime } from '@/utils';

const MeetingDetailPage: React.FC = () => {
  const router = useRouter();
  const meetingId = router.params.id || 'meeting1';
  
  const meeting = useAppStore(state => state.getMeetingById(meetingId));
  const updateMeetingStatus = useAppStore(state => state.updateMeetingStatus);
  const updateMeetingTopic = useAppStore(state => state.updateMeetingTopic);
  const setMeetingNotes = useAppStore(state => state.setMeetingNotes);
  const generateTaskFromTopic = useAppStore(state => state.generateTaskFromTopic);
  const getTaskById = useAppStore(state => state.getTaskById);
  const members = useAppStore(state => state.members);

  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState('');

  if (!meeting) {
    return (
      <View className={styles.meetingDetailPage}>
        <View style={{ padding: '100rpx', textAlign: 'center' }}>
          <Text>会议不存在</Text>
        </View>
      </View>
    );
  }

  const handleEditTopic = (topic: MeetingTopic) => {
    setEditingTopicId(topic.id);
  };

  const handleSaveTopic = (topicId: string) => {
    setEditingTopicId(null);
    Taro.showToast({ title: '已保存', icon: 'success' });
  };

  const handleUpdateConclusion = (topicId: string, conclusion: string) => {
    updateMeetingTopic(meetingId, topicId, { conclusion });
  };

  const handleUpdateAssignee = (topicId: string) => {
    Taro.showActionSheet({
      itemList: members.map(m => m.name),
      success: (res) => {
        const member = members[res.tapIndex];
        updateMeetingTopic(meetingId, topicId, { assignee: member.id });
      }
    });
  };

  const handleUpdateDueDate = (topicId: string, dueDate: string) => {
    updateMeetingTopic(meetingId, topicId, { dueDate });
  };

  const handleViewGeneratedTask = (topic: MeetingTopic) => {
    if (!topic.generatedTaskId) {
      handleRegenerateTask(topic);
      return;
    }

    const task = getTaskById(topic.generatedTaskId);
    if (task) {
      Taro.navigateTo({ url: `/pages/task-detail/index?id=${topic.generatedTaskId}` });
    } else {
      Taro.showModal({
        title: '任务不存在',
        content: '关联的任务已被删除，是否重新生成任务？',
        success: (res) => {
          if (res.confirm) {
            handleRegenerateTask(topic);
          }
        }
      });
    }
  };

  const handleRegenerateTask = (topic: MeetingTopic) => {
    Taro.showModal({
      title: '生成任务',
      content: `确定要从议题「${topic.title}」生成任务吗？`,
      success: (res) => {
        if (res.confirm) {
          const newTask = generateTaskFromTopic(meetingId, topic.id);
          if (newTask) {
            Taro.showToast({ title: '任务已生成', icon: 'success' });
          }
        }
      }
    });
  };

  const handleGenerateTask = (topic: MeetingTopic) => {
    if (topic.taskGenerated && topic.generatedTaskId) {
      handleViewGeneratedTask(topic);
      return;
    }

    handleRegenerateTask(topic);
  };

  const handleEditNotes = () => {
    setNotesText(meeting.notes || '');
    setEditingNotes(true);
  };

  const handleSaveNotes = () => {
    setMeetingNotes(meetingId, notesText);
    setEditingNotes(false);
    Taro.showToast({ title: '已保存', icon: 'success' });
  };

  const handleStartMeeting = () => {
    updateMeetingStatus(meetingId, 'ongoing' as MeetingStatus);
    Taro.showToast({ title: '会议已开始', icon: 'success' });
  };

  const handleEndMeeting = () => {
    Taro.showModal({
      title: '结束会议',
      content: '确定要结束本次会议吗？',
      success: (res) => {
        if (res.confirm) {
          updateMeetingStatus(meetingId, 'finished' as MeetingStatus);
          Taro.showToast({ title: '会议已结束', icon: 'success' });
        }
      }
    });
  };

  const getTopicAssignee = (assigneeId?: string) => {
    if (!assigneeId) return null;
    return members.find(m => m.id === assigneeId);
  };

  const isFinished = meeting.status === 'finished';
  const isOngoing = meeting.status === 'ongoing';
  const canEdit = isFinished || isOngoing;

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
          </View>
          <View className={styles.topicList}>
            {meeting.topics.map((topic, index) => {
              const assignee = getTopicAssignee(topic.assignee);
              const isEditing = editingTopicId === topic.id;

              return (
                <View key={topic.id} className={styles.topicItem}>
                  <View className={styles.topicHeader}>
                    <View className={styles.topicIndex}>{index + 1}</View>
                    <Text className={styles.topicTitle}>{topic.title}</Text>
                    {topic.taskGenerated && (
                      <View 
                        className={styles.topicTag}
                        onClick={(e) => {
                          e.stopPropagation?.();
                          handleViewGeneratedTask(topic);
                        }}
                      >
                        {getTaskById(topic.generatedTaskId || '') ? '已生成任务 →' : '任务已失效 ↻'}
                      </View>
                    )}
                  </View>
                  
                  {isEditing ? (
                    <View className={styles.topicEditPanel}>
                      <View className={styles.editField}>
                        <Text className={styles.editLabel}>结论</Text>
                        <Textarea
                          className={styles.editTextarea}
                          placeholder="请输入议题结论..."
                          value={topic.conclusion || ''}
                          onInput={(e) => handleUpdateConclusion(topic.id, e.detail.value)}
                          maxlength={500}
                          autoHeight
                        />
                      </View>
                      <View className={styles.editField}>
                        <Text className={styles.editLabel}>负责人</Text>
                        <View className={styles.editPicker} onClick={() => handleUpdateAssignee(topic.id)}>
                          <Text className={assignee ? '' : styles.placeholder}>
                            {assignee?.name || '请选择负责人'}
                          </Text>
                          <Text className={styles.arrow}>›</Text>
                        </View>
                      </View>
                      <View className={styles.editField}>
                        <Text className={styles.editLabel}>截止日期</Text>
                        <Picker 
                          mode="date" 
                          value={topic.dueDate || ''} 
                          onChange={(e) => handleUpdateDueDate(topic.id, e.detail.value)}
                        >
                          <View className={styles.editPicker}>
                            <Text className={topic.dueDate ? '' : styles.placeholder}>
                              {topic.dueDate || '请选择截止日期'}
                            </Text>
                            <Text className={styles.arrow}>›</Text>
                          </View>
                        </Picker>
                      </View>
                      <View className={styles.editActions}>
                        <View className={styles.saveBtn} onClick={() => handleSaveTopic(topic.id)}>
                          <Text>完成编辑</Text>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <View className={styles.topicContent}>
                      {topic.conclusion && (
                        <View className={styles.topicConclusion}>
                          <Text className={styles.conclusionLabel}>结论</Text>
                          <Text className={styles.conclusionText}>{topic.conclusion}</Text>
                        </View>
                      )}

                      {(topic.assignee || topic.dueDate) && (
                        <View className={styles.topicMeta}>
                          {topic.assignee && (
                            <View className={styles.metaItem}>
                              <Image 
                                className={styles.avatar} 
                                src={assignee?.avatar || ''} 
                                mode="aspectFill" 
                              />
                              <Text>负责人：{assignee?.name || ''}</Text>
                            </View>
                          )}
                          {topic.dueDate && (
                            <View className={styles.metaItem}>
                              <Text>📅 截止：{topic.dueDate}</Text>
                            </View>
                          )}
                        </View>
                      )}

                      {!topic.taskGenerated && canEdit && (
                        <View className={styles.topicActions}>
                          {!topic.conclusion && (
                            <View 
                              className={styles.actionBtn}
                              onClick={() => handleEditTopic(topic)}
                            >
                              <Text>📝 补结论</Text>
                            </View>
                          )}
                          {topic.conclusion && (
                            <>
                              <View 
                                className={styles.actionBtn}
                                onClick={() => handleEditTopic(topic)}
                              >
                                <Text>✏️ 编辑</Text>
                              </View>
                              <View 
                                className={`${styles.actionBtn} ${styles.primary}`}
                                onClick={() => handleGenerateTask(topic)}
                              >
                                <Text>➕ 生成任务</Text>
                              </View>
                            </>
                          )}
                        </View>
                      )}

                      {topic.taskGenerated && (
                        <View 
                          className={styles.viewTaskBtn}
                          onClick={() => handleViewGeneratedTask(topic)}
                        >
                          {getTaskById(topic.generatedTaskId || '') 
                            ? '查看生成的任务 →' 
                            : '任务已失效，重新生成 ↻'}
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        <View className={`${styles.section} ${styles.notes}`}>
          <View className={styles.sectionTitle}>
            <Text>会议纪要</Text>
            {canEdit && !editingNotes && (
              <Text className={styles.sectionAction} onClick={handleEditNotes}>
                {meeting.notes ? '编辑' : '添加'}
              </Text>
            )}
          </View>
          {editingNotes ? (
            <View className={styles.notesEditor}>
              <Textarea
                className={styles.notesTextarea}
                placeholder="请输入会议纪要..."
                value={notesText}
                onInput={(e) => setNotesText(e.detail.value)}
                maxlength={2000}
                autoHeight
              />
              <View className={styles.notesActions}>
                <View 
                  className={`${styles.actionBtn} ${styles.secondary}`}
                  onClick={() => setEditingNotes(false)}
                >
                  <Text>取消</Text>
                </View>
                <View 
                  className={`${styles.actionBtn} ${styles.primary}`}
                  onClick={handleSaveNotes}
                >
                  <Text>保存</Text>
                </View>
              </View>
            </View>
          ) : (
            meeting.notes ? (
              <Text className={styles.notesText}>{meeting.notes}</Text>
            ) : (
              canEdit ? (
                <View className={styles.emptyNotes}>
                  <Text className={styles.emptyIcon}>📝</Text>
                  <Text className={styles.emptyText}>暂无纪要，点击右上角添加</Text>
                </View>
              ) : (
                <Text style={{ fontSize: '24rpx', color: '#86909c' }}>暂无会议纪要</Text>
              )
            )
          )}
        </View>

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
        {meeting.status === 'upcoming' ? (
          <>
            <View className={`${styles.btn} ${styles.secondary}`}>
              <Text>编辑</Text>
            </View>
            <View className={`${styles.btn} ${styles.primary}`} onClick={handleStartMeeting}>
              <Text>开始会议</Text>
            </View>
          </>
        ) : meeting.status === 'ongoing' ? (
          <>
            <View className={`${styles.btn} ${styles.secondary}`}>
              <Text>添加议题</Text>
            </View>
            <View className={`${styles.btn} ${styles.primary}`} onClick={handleEndMeeting}>
              <Text>结束会议</Text>
            </View>
          </>
        ) : (
          <>
            <View className={`${styles.btn} ${styles.secondary}`}>
              <Text>分享纪要</Text>
            </View>
            <View 
              className={`${styles.btn} ${styles.primary}`} 
              onClick={() => Taro.showToast({ title: '查看纪要', icon: 'none' })}
            >
              <Text>查看纪要</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default MeetingDetailPage;
