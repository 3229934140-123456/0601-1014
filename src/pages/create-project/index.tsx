import React, { useState } from 'react';
import { View, Text, Input, Textarea, Image, ScrollView, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useAppStore';

const colorOptions = [
  '#2F6BFF',
  '#36CFC9',
  '#722ED1',
  '#FF7D00',
  '#00B42A',
  '#F53F3F'
];

const CreateProjectPage: React.FC = () => {
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>(['m1']);

  const members = useAppStore(state => state.members);
  const currentUserId = useAppStore(state => state.currentUserId);
  const getCurrentUser = useAppStore(state => state.getCurrentUser);
  const addProject = useAppStore(state => state.addProject);

  const currentUser = getCurrentUser();

  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      }
      return [...prev, memberId];
    });
  };

  const handleDateChange = (e: any) => {
    setEndDate(e.detail.value);
  };

  const handleAddMember = () => {
    Taro.showToast({ title: '邀请成员功能开发中', icon: 'none' });
  };

  const handleSubmit = () => {
    if (!projectName.trim()) {
      Taro.showToast({ title: '请输入项目名称', icon: 'none' });
      return;
    }

    if (selectedMembers.length === 0) {
      Taro.showToast({ title: '请至少选择一名成员', icon: 'none' });
      return;
    }

    Taro.showLoading({ title: '创建中...' });
    
    try {
      const newProject = addProject({
        name: projectName.trim(),
        description: projectDesc.trim(),
        status: 'active',
        coverColor: selectedColor,
        creatorId: currentUserId,
        creatorName: currentUser?.name || '当前用户',
        memberIds: selectedMembers,
        endDate: endDate || undefined
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

  const canSubmit = projectName.trim().length > 0;

  return (
    <View className={styles.createProjectPage}>
      <ScrollView scrollY>
        <Text className={styles.sectionTitle}>基本信息</Text>
        <View className={styles.formSection}>
          <View className={styles.formItem}>
            <Text className={styles.label}>
              <Text className={styles.required}>*</Text>
              项目名称
            </Text>
            <View className={styles.inputWrapper}>
              <Input
                className={styles.input}
                placeholder="请输入项目名称"
                value={projectName}
                onInput={(e) => setProjectName(e.detail.value)}
                maxlength={50}
              />
            </View>
          </View>
          <View className={styles.formItem}>
            <Text className={styles.label}>项目描述</Text>
            <View className={styles.inputWrapper}>
              <Textarea
                className={styles.textarea}
                placeholder="请输入项目描述..."
                value={projectDesc}
                onInput={(e) => setProjectDesc(e.detail.value)}
                maxlength={500}
                autoHeight
              />
            </View>
          </View>
          <View className={styles.formItem}>
            <Text className={styles.label}>截止日期</Text>
            <Picker mode="date" value={endDate} onChange={handleDateChange}>
              <View className={styles.inputWrapper}>
                <Text className={endDate ? '' : styles.placeholder}>
                  {endDate || '请选择截止日期'}
                </Text>
                <Text className={styles.arrow}>›</Text>
              </View>
            </Picker>
          </View>
        </View>

        <Text className={styles.sectionTitle}>项目颜色</Text>
        <View className={styles.formSection}>
          <View className={styles.colorSelector}>
            {colorOptions.map(color => (
              <View
                key={color}
                className={classnames(styles.colorOption, selectedColor === color && styles.active)}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </View>
        </View>

        <Text className={styles.sectionTitle}>项目成员</Text>
        <View className={styles.formSection}>
          <View className={styles.memberSelector}>
            <View className={styles.memberList}>
              {members.map(member => (
                <View
                  key={member.id}
                  className={classnames(styles.memberItem, selectedMembers.includes(member.id) && styles.selected)}
                  onClick={() => toggleMember(member.id)}
                >
                  <View className={styles.avatar}>
                    <Image src={member.avatar} mode="aspectFill" />
                  </View>
                  {selectedMembers.includes(member.id) && (
                    <View className={styles.checkBadge}>✓</View>
                  )}
                  <Text className={styles.name}>{member.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View
          className={classnames(styles.submitBtn, !canSubmit && styles.disabled)}
          onClick={canSubmit ? handleSubmit : undefined}
        >
          <Text>创建项目</Text>
        </View>
      </View>
    </View>
  );
};

export default CreateProjectPage;
