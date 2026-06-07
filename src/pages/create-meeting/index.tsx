import React, { useState, useMemo } from 'react';
import { View, Text, Input, Image, ScrollView, Picker } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useAppStore';
import { generateId } from '@/utils';

const CreateMeetingPage: React.FC = () => {
  const router = useRouter();
  const initialProjectId = router.params.projectId || '';

  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(initialProjectId);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [attendeeIds, setAttendeeIds] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>(['']);

  const projects = useAppStore(state => state.projects);
  const members = useAppStore(state => state.members);
  const currentUserId = useAppStore(state => state.currentUserId);
  const getCurrentUser = useAppStore(state => state.getCurrentUser);
  const addMeeting = useAppStore(state => state.addMeeting);
  const addNotification = useAppStore(state => state.addNotification);

  const currentUser = getCurrentUser();
  const activeProjects = useMemo(() => projects.filter(p => p.status === 'active'), [projects]);
  const selectedProject = useMemo(() => projects.find(p => p.id === projectId), [projects, projectId]);

  const toggleAttendee = (memberId: string) => {
    setAttendeeIds(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      }
      return [...prev, memberId];
    });
  };

  const handleProjectSelect = () => {
    if (activeProjects.length === 0) {
      Taro.showToast({ title: '暂无进行中的项目', icon: 'none' });
      return;
    }
    Taro.showActionSheet({
      itemList: activeProjects.map(p => p.name),
      success: (res) => {
        setProjectId(activeProjects[res.tapIndex].id);
      }
    });
  };

  const handleStartDateChange = (e: any) => {
    setStartDate(e.detail.value);
    if (!endDate) {
      setEndDate(e.detail.value);
    }
  };

  const handleStartTimeChange = (e: any) => {
    setStartTime(e.detail.value);
  };

  const handleEndDateChange = (e: any) => {
    setEndDate(e.detail.value);
  };

  const handleEndTimeChange = (e: any) => {
    setEndTime(e.detail.value);
  };

  const handleTopicChange = (index: number, value: string) => {
    setTopics(prev => {
      const newTopics = [...prev];
      newTopics[index] = value;
      return newTopics;
    });
  };

  const handleAddTopic = () => {
    setTopics(prev => [...prev, '']);
  };

  const handleRemoveTopic = (index: number) => {
    if (topics.length <= 1) return;
    setTopics(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入会议主题', icon: 'none' });
      return;
    }
    if (!projectId) {
      Taro.showToast({ title: '请选择所属项目', icon: 'none' });
      return;
    }
    if (!startDate || !startTime) {
      Taro.showToast({ title: '请选择开始时间', icon: 'none' });
      return;
    }
    if (!endDate || !endTime) {
      Taro.showToast({ title: '请选择结束时间', icon: 'none' });
      return;
    }
    if (attendeeIds.length === 0) {
      Taro.showToast({ title: '请选择参会人员', icon: 'none' });
      return;
    }

    const startDateTime = `${startDate} ${startTime}:00`;
    const endDateTime = `${endDate} ${endTime}:00`;

    if (new Date(startDateTime) >= new Date(endDateTime)) {
      Taro.showToast({ title: '结束时间需晚于开始时间', icon: 'none' });
      return;
    }

    Taro.showLoading({ title: '创建中...' });

    try {
      const validTopics = topics.filter(t => t.trim().length > 0);
      
      const newMeeting = addMeeting({
        title: title.trim(),
        projectId,
        projectName: selectedProject?.name || '',
        startTime: startDateTime,
        endTime: endDateTime,
        location: location.trim() || '线上会议',
        organizerId: currentUserId,
        organizerName: currentUser?.name || '',
        attendeeIds,
        topicTitles: validTopics
      });

      attendeeIds.forEach(attendeeId => {
        if (attendeeId !== currentUserId) {
          const attendee = members.find(m => m.id === attendeeId);
          addNotification({
            type: 'meeting_reminder',
            title: '新会议邀请',
            content: `${currentUser?.name}邀请你参加会议：${title.trim()}`,
            relatedId: newMeeting.id,
            relatedType: 'meeting',
            senderId: currentUserId,
            senderName: currentUser?.name,
            senderAvatar: currentUser?.avatar
          });
        }
      });

      Taro.hideLoading();
      Taro.showToast({ title: '创建成功', icon: 'success' });
      
      setTimeout(() => {
        Taro.navigateBack();
      }, 800);
    } catch (error) {
      Taro.hideLoading();
      Taro.showToast({ title: '创建失败，请重试', icon: 'none' });
    }
  };

  const canSubmit = title.trim().length > 0 && projectId && startDate && startTime && endDate && endTime && attendeeIds.length > 0;

  return (
    <View className={styles.createMeetingPage}>
      <ScrollView scrollY>
        <Text className={styles.sectionTitle}>基本信息</Text>
        <View className={styles.formSection}>
          <View className={styles.formItem}>
            <Text className={styles.label}>
              <Text className={styles.required}>*</Text>
              会议主题
            </Text>
            <View className={styles.inputWrapper}>
              <Input
                className={styles.input}
                placeholder="请输入会议主题"
                value={title}
                onInput={(e) => setTitle(e.detail.value)}
                maxlength={100}
              />
            </View>
          </View>
          <View className={styles.formItem}>
            <Text className={styles.label}>
              <Text className={styles.required}>*</Text>
              所属项目
            </Text>
            <View className={styles.inputWrapper} onClick={handleProjectSelect}>
              <Text className={selectedProject ? '' : styles.placeholder}>
                {selectedProject?.name || '请选择项目'}
              </Text>
              <Text className={styles.arrow}>›</Text>
            </View>
          </View>
          <View className={styles.formItem}>
            <Text className={styles.label}>会议地点</Text>
            <View className={styles.inputWrapper}>
              <Input
                className={styles.input}
                placeholder="请输入会议地点"
                value={location}
                onInput={(e) => setLocation(e.detail.value)}
                maxlength={100}
              />
            </View>
          </View>
        </View>

        <Text className={styles.sectionTitle}>会议时间</Text>
        <View className={styles.formSection}>
          <View className={styles.formItem}>
            <Text className={styles.label}>
              <Text className={styles.required}>*</Text>
              开始时间
            </Text>
            <View className={styles.timeRange}>
              <Picker mode="date" value={startDate} onChange={handleStartDateChange}>
                <View className={classnames(styles.timePicker, !startDate && styles.placeholder)}>
                  {startDate || '选择日期'}
                </View>
              </Picker>
              <Text className={styles.timeDivider}></Text>
              <Picker mode="time" value={startTime} onChange={handleStartTimeChange}>
                <View className={styles.timePicker}>
                  {startTime}
                </View>
              </Picker>
            </View>
          </View>
          <View className={styles.formItem}>
            <Text className={styles.label}>
              <Text className={styles.required}>*</Text>
              结束时间
            </Text>
            <View className={styles.timeRange}>
              <Picker mode="date" value={endDate} onChange={handleEndDateChange}>
                <View className={classnames(styles.timePicker, !endDate && styles.placeholder)}>
                  {endDate || '选择日期'}
                </View>
              </Picker>
              <Text className={styles.timeDivider}></Text>
              <Picker mode="time" value={endTime} onChange={handleEndTimeChange}>
                <View className={styles.timePicker}>
                  {endTime}
                </View>
              </Picker>
            </View>
          </View>
        </View>

        <Text className={styles.sectionTitle}>参会人员</Text>
        <View className={styles.formSection}>
          <View className={styles.attendeeSelector}>
            <View className={styles.attendeeList}>
              {members.map(member => (
                <View
                  key={member.id}
                  className={classnames(styles.attendeeItem, attendeeIds.includes(member.id) && styles.selected)}
                  onClick={() => toggleAttendee(member.id)}
                >
                  <View className={styles.avatar}>
                    <Image src={member.avatar} mode="aspectFill" />
                  </View>
                  {attendeeIds.includes(member.id) && (
                    <View className={styles.checkBadge}>✓</View>
                  )}
                  <Text className={styles.name}>{member.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <Text className={styles.sectionTitle}>会议议题</Text>
        <View className={styles.formSection}>
          <View className={styles.topicsSection}>
            {topics.map((topic, index) => (
              <View key={index} className={styles.topicItem}>
                <Input
                  className={styles.topicInput}
                  placeholder={`议题 ${index + 1}`}
                  value={topic}
                  onInput={(e) => handleTopicChange(index, e.detail.value)}
                  maxlength={100}
                />
                {topics.length > 1 && (
                  <View className={styles.deleteBtn} onClick={() => handleRemoveTopic(index)}>
                    <Text>✕</Text>
                  </View>
                )}
              </View>
            ))}
            <View className={styles.addTopicBtn} onClick={handleAddTopic}>
              <Text className={styles.addIcon}>+</Text>
              <Text>添加议题</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View
          className={classnames(styles.submitBtn, !canSubmit && styles.disabled)}
          onClick={canSubmit ? handleSubmit : undefined}
        >
          <Text>创建会议</Text>
        </View>
      </View>
    </View>
  );
};

export default CreateMeetingPage;
