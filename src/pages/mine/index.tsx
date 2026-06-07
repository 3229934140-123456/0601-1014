import React from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { members, currentUserId } from '@/data/members';
import { projects } from '@/data/projects';
import { tasks, getMyTasks } from '@/data/tasks';
import { files, getFavoriteFiles } from '@/data/files';

const MinePage: React.FC = () => {
  const currentUser = members.find(m => m.id === currentUserId);
  const myTasks = getMyTasks(currentUserId);
  
  const myProjects = projects.filter(p => 
    p.members.some(m => m.id === currentUserId)
  );
  
  const completedTasks = myTasks.filter(t => t.status === 'done').length;
  const favoriteFiles = getFavoriteFiles();

  const handleMyTasks = () => {
    Taro.switchTab({ url: '/pages/kanban/index' });
  };

  const handleMyProjects = () => {
    Taro.switchTab({ url: '/pages/home/index' });
  };

  const handleMyFavorites = () => {
    if (projects.length > 0) {
      Taro.navigateTo({ url: `/pages/files/index?projectId=${projects[0].id}` });
    }
  };

  const handleWeeklyReport = () => {
    Taro.navigateTo({ url: '/pages/review/index' });
  };

  const handleMembers = () => {
    if (projects.length > 0) {
      Taro.navigateTo({ url: `/pages/members/index?projectId=${projects[0].id}` });
    }
  };

  const handleSettings = () => {
    Taro.showToast({ title: '设置', icon: 'none' });
  };

  const handleHelp = () => {
    Taro.showToast({ title: '帮助与反馈', icon: 'none' });
  };

  const handleAbout = () => {
    Taro.showToast({ title: '关于我们', icon: 'none' });
  };

  const handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已退出', icon: 'success' });
        }
      }
    });
  };

  return (
    <ScrollView className={styles.minePage} scrollY>
      <View className={styles.header}>
        <View className={styles.userInfo}>
          <View className={styles.avatar}>
            <Image src={currentUser?.avatar || 'https://picsum.photos/id/64/200/200'} mode="aspectFill" />
          </View>
          <View className={styles.info}>
            <Text className={styles.name}>{currentUser?.name || '用户'}</Text>
            <Text className={styles.role}>{currentUser?.role || '成员'}</Text>
            <Text className={styles.department}>{currentUser?.department || ''}</Text>
          </View>
          <Text className={styles.settingsBtn} onClick={handleSettings}>⚙️</Text>
        </View>
      </View>

      <View className={styles.statsCard}>
        <View className={styles.statItem} onClick={handleMyProjects}>
          <Text className={styles.statNumber}>{myProjects.length}</Text>
          <Text className={styles.statLabel}>参与项目</Text>
        </View>
        <View className={styles.divider} />
        <View className={styles.statItem} onClick={handleMyTasks}>
          <Text className={styles.statNumber}>{completedTasks}</Text>
          <Text className={styles.statLabel}>已完成任务</Text>
        </View>
        <View className={styles.divider} />
        <View className={styles.statItem} onClick={handleMyFavorites}>
          <Text className={styles.statNumber}>{favoriteFiles.length}</Text>
          <Text className={styles.statLabel}>收藏文件</Text>
        </View>
      </View>

      <View className={styles.menuSection}>
        <View className={styles.menuItem} onClick={handleWeeklyReport}>
          <View className={`${styles.menuIcon} ${styles.blue}`}>
            <Text>📊</Text>
          </View>
          <Text className={styles.menuText}>周报摘要</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={handleMyFavorites}>
          <View className={`${styles.menuIcon} ${styles.orange}`}>
            <Text>⭐</Text>
          </View>
          <Text className={styles.menuText}>我的收藏</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={handleMembers}>
          <View className={`${styles.menuIcon} ${styles.green}`}>
            <Text>👥</Text>
          </View>
          <Text className={styles.menuText}>团队成员</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      <View className={styles.menuSection}>
        <View className={styles.menuItem} onClick={handleSettings}>
          <View className={`${styles.menuIcon} ${styles.purple}`}>
            <Text>⚙️</Text>
          </View>
          <Text className={styles.menuText}>设置</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={handleHelp}>
          <View className={`${styles.menuIcon} ${styles.cyan}`}>
            <Text>❓</Text>
          </View>
          <Text className={styles.menuText}>帮助与反馈</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={handleAbout}>
          <View className={`${styles.menuIcon} ${styles.green}`}>
            <Text>ℹ️</Text>
          </View>
          <Text className={styles.menuText}>关于我们</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      <View className={styles.logoutBtn} onClick={handleLogout}>
        <Text>退出登录</Text>
      </View>
    </ScrollView>
  );
};

export default MinePage;
