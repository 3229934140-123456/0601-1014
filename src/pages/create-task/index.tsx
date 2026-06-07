import React, { useState, useMemo } from 'react';
import { View, Text, Input, Textarea, Image, ScrollView, Picker } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useAppStore';
import { TaskStatus } from '@/types';

const CreateTaskPage: React.FC = () => {
  const router = useRouter();
  const initialProjectId = router.params.projectId || '';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(initialProjectId);
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');

  const projects = useAppStore(state => state.projects);
  const members = useAppStore(state => state.members);
  const currentUserId = useAppStore(state => state.currentUserId);
  const getCurrentUser = useAppStore(state => state.getCurrentUser);
  const addTask = useAppStore(state => state.addTask);
  const addNotification = useAppStore(state => state.addNotification);

  const currentUser = getCurrentUser();
  const activeProjects = useMemo(() => projects.filter(p => p.status === 'active'), [projects]);
  const selectedProject = useMemo(() => projects.find(p => p.id === projectId), [projects, projectId]);
  const selectedAssignee = useMemo(() => members.find(m => m.id === assigneeId), [members, assigneeId]);

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

  const handleAssigneeSelect = () => {
    Taro.showActionSheet({
      itemList: members.map(m => m.name),
      success: (res) => {
        setAssigneeId(members[res.tapIndex].id);
      }
    });
  };

  const handleDateChange = (e: any) => {
    setDueDate(e.detail.value);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入任务标题', icon: 'none' });
      return;
    }
    if (!projectId) {
      Taro.showToast({ title: '请选择所属项目', icon: 'none' });
      return;
    }
    if (!assigneeId) {
      Taro.showToast({ title: '请选择负责人', icon: 'none' });
      return;
    }
    if (!dueDate) {
      Taro.showToast({ title: '请选择截止时间', icon: 'none' });
      return;
    }

    Taro.showLoading({ title: '创建中...' });

    try {
      const newTask = addTask({
        title: title.trim(),
        description: description.trim(),
        status: 'todo' as TaskStatus,
        priority,
        projectId,
        projectName: selectedProject?.name || '',
        assigneeId,
        assigneeName: selectedAssignee?.name || '',
        assigneeAvatar: selectedAssignee?.avatar || '',
        creatorId: currentUserId,
        creatorName: currentUser?.name || '',
        dueDate
      });

      if (assigneeId !== currentUserId) {
        addNotification({
          type: 'task_assigned',
          title: '新任务指派',
          content: `${currentUser?.name}给你指派了一个新任务：${title.trim()}`,
          relatedId: newTask.id,
          relatedType: 'task',
          senderId: currentUserId,
          senderName: currentUser?.name,
          senderAvatar: currentUser?.avatar
        });
      }

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

  const canSubmit = title.trim().length > 0 && projectId && assigneeId && dueDate;

  return (
    <View className={styles.createTaskPage}>
      <ScrollView scrollY>
        <Text className={styles.sectionTitle}>基本信息</Text>
        <View className={styles.formSection}>
          <View className={styles.formItem}>
            <Text className={styles.label}>
              <Text className={styles.required}>*</Text>
              任务标题
            </Text>
            <View className={styles.inputWrapper}>
              <Input
                className={styles.input}
                placeholder="请输入任务标题"
                value={title}
                onInput={(e) => setTitle(e.detail.value)}
                maxlength={100}
              />
            </View>
          </View>
          <View className={styles.formItem}>
            <Text className={styles.label}>任务描述</Text>
            <View className={styles.inputWrapper}>
              <Textarea
                className={styles.textarea}
                placeholder="请输入任务描述..."
                value={description}
                onInput={(e) => setDescription(e.detail.value)}
                maxlength={500}
                autoHeight
              />
            </View>
          </View>
        </View>

        <Text className={styles.sectionTitle}>任务属性</Text>
        <View className={styles.formSection}>
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
            <Text className={styles.label}>
              <Text className={styles.required}>*</Text>
              负责人
            </Text>
            <View className={styles.inputWrapper} onClick={handleAssigneeSelect}>
              <Text className={selectedAssignee ? '' : styles.placeholder}>
                {selectedAssignee?.name || '请选择负责人'}
              </Text>
              <Text className={styles.arrow}>›</Text>
            </View>
          </View>
          <View className={styles.formItem}>
            <Text className={styles.label}>
              <Text className={styles.required}>*</Text>
              截止时间
            </Text>
            <Picker mode="date" value={dueDate} onChange={handleDateChange}>
              <View className={styles.inputWrapper}>
                <Text className={dueDate ? '' : styles.placeholder}>
                  {dueDate || '请选择截止日期'}
                </Text>
                <Text className={styles.arrow}>›</Text>
              </View>
            </Picker>
          </View>
        </View>

        <Text className={styles.sectionTitle}>优先级</Text>
        <View className={styles.formSection}>
          <View className={styles.prioritySelector}>
            <View 
              className={classnames(styles.priorityOption, priority === 'low' && styles.active)}
              onClick={() => setPriority('low')}
            >
              <View className={classnames(styles.priorityDot, styles.low)} />
              <Text className={styles.priorityLabel}>低</Text>
            </View>
            <View 
              className={classnames(styles.priorityOption, priority === 'medium' && styles.active)}
              onClick={() => setPriority('medium')}
            >
              <View className={classnames(styles.priorityDot, styles.medium)} />
              <Text className={styles.priorityLabel}>中</Text>
            </View>
            <View 
              className={classnames(styles.priorityOption, priority === 'high' && styles.active)}
              onClick={() => setPriority('high')}
            >
              <View className={classnames(styles.priorityDot, styles.high)} />
              <Text className={styles.priorityLabel}>高</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View
          className={classnames(styles.submitBtn, !canSubmit && styles.disabled)}
          onClick={canSubmit ? handleSubmit : undefined}
        >
          <Text>创建任务</Text>
        </View>
      </View>
    </View>
  );
};

export default CreateTaskPage;
