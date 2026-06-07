import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView, Input } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useAppStore';
import { Member } from '@/types';

const MembersPage: React.FC = () => {
  const router = useRouter();
  const projectId = router.params.projectId || 'p1';
  
  const project = useAppStore(state => state.getProjectById(projectId));
  const allMembers = useAppStore(state => state.members);
  const addProjectMember = useAppStore(state => state.addProjectMember);
  const removeProjectMember = useAppStore(state => state.removeProjectMember);
  
  const [searchText, setSearchText] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);

  const projectMemberIds = useMemo(() => {
    return project?.members.map(m => m.id) || [];
  }, [project]);

  const projectMembers = useMemo(() => {
    if (!project) return [];
    if (!searchText) return project.members;
    const lower = searchText.toLowerCase();
    return project.members.filter(m => 
      m.name.toLowerCase().includes(lower) || 
      m.role.toLowerCase().includes(lower) ||
      m.department.toLowerCase().includes(lower)
    );
  }, [project, searchText]);

  const availableMembers = useMemo(() => {
    return allMembers.filter(m => !projectMemberIds.includes(m.id));
  }, [allMembers, projectMemberIds]);

  const groupedMembers = useMemo(() => {
    const groups: Record<string, Member[]> = {};
    projectMembers.forEach(member => {
      const dept = member.department;
      if (!groups[dept]) {
        groups[dept] = [];
      }
      groups[dept].push(member);
    });
    return groups;
  }, [projectMembers]);

  const handleMemberClick = (member: Member) => {
    Taro.showActionSheet({
      itemList: ['拨打电话', '发送消息', '查看详情', '移出项目'],
      success: (res) => {
        if (res.tapIndex === 0) {
          Taro.showToast({ title: `拨打 ${member.phone || '电话'}`, icon: 'none' });
        } else if (res.tapIndex === 1) {
          Taro.showToast({ title: `发送消息给 ${member.name}`, icon: 'none' });
        } else if (res.tapIndex === 2) {
          Taro.showToast({ title: '查看详情', icon: 'none' });
        } else if (res.tapIndex === 3) {
          if (projectMemberIds.length <= 1) {
            Taro.showToast({ title: '项目至少保留一名成员', icon: 'none' });
            return;
          }
          Taro.showModal({
            title: '确认移出',
            content: `确定要将 ${member.name} 移出项目吗？`,
            success: (modalRes) => {
              if (modalRes.confirm) {
                removeProjectMember(projectId, member.id);
                Taro.showToast({ title: '已移出项目', icon: 'success' });
              }
            }
          });
        }
      }
    });
  };

  const handleAddMember = () => {
    if (availableMembers.length === 0) {
      Taro.showToast({ title: '没有可添加的成员', icon: 'none' });
      return;
    }
    setShowAddMember(!showAddMember);
  };

  const handleSelectAddMember = (member: Member) => {
    addProjectMember(projectId, member.id);
    Taro.showToast({ title: `已添加 ${member.name}`, icon: 'success' });
  };

  const handleSearchInput = (e: any) => {
    setSearchText(e.detail.value);
  };

  if (!project) {
    return (
      <View className={styles.membersPage}>
        <View style={{ padding: '100rpx', textAlign: 'center' }}>
          <Text>项目不存在</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.membersPage}>
      <View className={styles.header}>
        <Text className={styles.projectName}>{project.name}</Text>
        <Text className={styles.memberCount}>共 {project.memberCount} 名成员</Text>
      </View>

      <View className={styles.searchBar}>
        <View className={styles.searchInput}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            placeholder="搜索成员姓名、部门..."
            value={searchText}
            onInput={handleSearchInput}
            style={{ flex: 1, fontSize: '24rpx' }}
          />
        </View>
        <View className={styles.addBtn} onClick={handleAddMember}>
          <Text className={styles.addIcon}>➕</Text>
          <Text>添加</Text>
        </View>
      </View>

      {showAddMember && availableMembers.length > 0 && (
        <View className={styles.addMemberPanel}>
          <Text className={styles.panelTitle}>可添加成员</Text>
          <ScrollView scrollY style={{ maxHeight: '400rpx' }}>
            {availableMembers.map(member => (
              <View 
                key={member.id} 
                className={styles.addMemberItem}
                onClick={() => handleSelectAddMember(member)}
              >
                <Image src={member.avatar} className={styles.smallAvatar} mode="aspectFill" />
                <View className={styles.memberInfo}>
                  <Text className={styles.memberName}>{member.name}</Text>
                  <Text className={styles.memberDept}>{member.department} · {member.role}</Text>
                </View>
                <Text className={styles.addMemberBtn}>+ 添加</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView scrollY className={styles.content}>
        {Object.keys(groupedMembers).length > 0 ? (
          Object.entries(groupedMembers).map(([dept, deptMembers]) => (
            <View key={dept}>
              <View className={styles.sectionHeader}>
                <Text>{dept} · {deptMembers.length}人</Text>
              </View>
              <View className={styles.memberList}>
                {deptMembers.map(member => (
                  <View 
                    key={member.id} 
                    className={styles.memberItem}
                    onClick={() => handleMemberClick(member)}
                  >
                    <View className={styles.avatar}>
                      <Image src={member.avatar} mode="aspectFill" />
                    </View>
                    <View className={styles.info}>
                      <Text className={styles.name}>{member.name}</Text>
                      <Text className={styles.role}>{member.role}</Text>
                      <Text className={styles.department}>{member.department}</Text>
                    </View>
                    <View className={styles.actions}>
                      <View className={`${styles.actionBtn} ${styles.call}`}>
                        <Text>📞</Text>
                      </View>
                      <View className={`${styles.actionBtn} ${styles.message}`}>
                        <Text>💬</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>👥</Text>
            <Text className={styles.emptyText}>暂无成员</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default MembersPage;
