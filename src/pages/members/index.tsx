import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView, Input } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { members } from '@/data/members';
import { projects } from '@/data/projects';
import { Member } from '@/types';

const MembersPage: React.FC = () => {
  const router = useRouter();
  const projectId = router.params.projectId || 'p1';
  const project = projects.find(p => p.id === projectId);
  
  const [searchText, setSearchText] = useState('');

  const memberList = project?.members || members;

  const filteredMembers = useMemo(() => {
    if (!searchText) return memberList;
    const lower = searchText.toLowerCase();
    return memberList.filter(m => 
      m.name.toLowerCase().includes(lower) || 
      m.role.toLowerCase().includes(lower) ||
      m.department.toLowerCase().includes(lower)
    );
  }, [memberList, searchText]);

  const groupedMembers = useMemo(() => {
    const groups: Record<string, Member[]> = {};
    filteredMembers.forEach(member => {
      const dept = member.department;
      if (!groups[dept]) {
        groups[dept] = [];
      }
      groups[dept].push(member);
    });
    return groups;
  }, [filteredMembers]);

  const handleMemberClick = (member: Member) => {
    Taro.showActionSheet({
      itemList: ['拨打电话', '发送消息', '查看详情'],
      success: (res) => {
        if (res.tapIndex === 0) {
          Taro.showToast({ title: `拨打 ${member.phone || '电话'}`, icon: 'none' });
        } else if (res.tapIndex === 1) {
          Taro.showToast({ title: `发送消息给 ${member.name}`, icon: 'none' });
        } else {
          Taro.showToast({ title: '查看详情', icon: 'none' });
        }
      }
    });
  };

  const handleInvite = () => {
    Taro.showToast({ title: '邀请成员', icon: 'none' });
  };

  const handleSearchInput = (e: any) => {
    setSearchText(e.detail.value);
  };

  return (
    <View className={styles.membersPage}>
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
      </View>

      <ScrollView scrollY>
        <View className={styles.inviteBtn} onClick={handleInvite}>
          <Text className={styles.btnIcon}>➕</Text>
          <Text>邀请新成员</Text>
        </View>

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
