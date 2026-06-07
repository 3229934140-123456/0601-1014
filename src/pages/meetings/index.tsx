import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import MeetingCard from '@/components/MeetingCard';
import { useAppStore } from '@/store/useAppStore';
import { formatDate } from '@/utils';
import dayjs from 'dayjs';

type TabType = 'upcoming' | 'finished';

const MeetingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');

  const meetings = useAppStore(state => state.meetings);

  const displayedMeetings = useMemo(() => {
    const now = new Date();
    if (activeTab === 'upcoming') {
      return meetings.filter(m => new Date(m.startTime) >= now || m.status === 'upcoming');
    }
    return meetings.filter(m => new Date(m.endTime) < now || m.status === 'finished');
  }, [activeTab, meetings]);

  const groupedMeetings = useMemo(() => {
    const groups: Record<string, typeof meetings> = {};
    displayedMeetings.forEach(meeting => {
      const dateKey = formatDate(meeting.startTime);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(meeting);
    });
    return groups;
  }, [displayedMeetings]);

  const handleCreateMeeting = () => {
    Taro.navigateTo({ url: '/pages/create-meeting/index' });
  };

  const handleSearch = () => {
    Taro.navigateTo({ url: '/pages/search/index' });
  };

  const handlePullDownRefresh = () => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  };

  React.useEffect(() => {
    Taro.onPullDownRefresh(handlePullDownRefresh);
    return () => {
      Taro.offPullDownRefresh(handlePullDownRefresh);
    };
  }, []);

  const formatDateLabel = (dateStr: string): string => {
    const date = dayjs(dateStr);
    const today = dayjs().startOf('day');
    const diffDays = date.diff(today, 'day');
    
    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '明天';
    if (diffDays === -1) return '昨天';
    if (diffDays > 1 && diffDays < 7) return `${diffDays}天后`;
    if (diffDays < -1 && diffDays > -7) return `${Math.abs(diffDays)}天前`;
    return formatDate(dateStr, 'MM月DD日');
  };

  return (
    <View className={styles.meetingsPage}>
      <View className={styles.searchBar}>
        <View className={styles.searchInput} onClick={handleSearch}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Text className={styles.searchText}>搜索会议...</Text>
        </View>
      </View>

      <View className={styles.tabBar}>
        <Text
          className={`${styles.tabItem} ${activeTab === 'upcoming' ? styles.active : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          即将开始
        </Text>
        <Text
          className={`${styles.tabItem} ${activeTab === 'finished' ? styles.active : ''}`}
          onClick={() => setActiveTab('finished')}
        >
          已结束
        </Text>
      </View>

      <ScrollView scrollY className={styles.listContainer}>
        {displayedMeetings.length > 0 ? (
          Object.entries(groupedMeetings).map(([date, dateMeetings]) => (
            <View key={date} className={styles.dateGroup}>
              <View className={styles.dateHeader}>
                <Text className={styles.dateText}>{formatDateLabel(date)}</Text>
                <Text className={styles.countBadge}>{dateMeetings.length}场</Text>
              </View>
              {dateMeetings.map(meeting => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))}
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📅</Text>
            <Text className={styles.emptyText}>
              {activeTab === 'upcoming' ? '暂无即将开始的会议' : '暂无已结束的会议'}
            </Text>
            <Text className={styles.emptyTip}>点击右下角按钮安排新会议</Text>
          </View>
        )}
      </ScrollView>

      <View className={styles.fabButton} onClick={handleCreateMeeting}>
        <Text className={styles.fabIcon}>➕</Text>
      </View>
    </View>
  );
};

export default MeetingsPage;
