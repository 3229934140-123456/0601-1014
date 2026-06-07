import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { projects } from '@/data/projects';
import { tasks } from '@/data/tasks';
import { meetings } from '@/data/meetings';
import { files } from '@/data/files';

type SearchTab = 'all' | 'project' | 'task' | 'meeting' | 'file';

const tabList: { key: SearchTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'project', label: '项目' },
  { key: 'task', label: '任务' },
  { key: 'meeting', label: '会议' },
  { key: 'file', label: '文件' }
];

const hotKeywords = [
  { keyword: '电商平台重构', hot: true },
  { keyword: '移动端App', hot: false },
  { keyword: '数据分析平台', hot: false },
  { keyword: '智能客服系统', hot: true },
  { keyword: '官网改版', hot: false }
];

const historyKeywords = ['项目进度', '任务分配', '周会纪要', '设计稿', '测试报告'];

const SearchPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [searchHistory, setSearchHistory] = useState<string[]>(historyKeywords);

  const hasSearched = searchText.trim().length > 0;

  const searchResults = useMemo(() => {
    if (!searchText.trim()) return { projects: [], tasks: [], meetings: [], files: [] };

    const keyword = searchText.toLowerCase();

    return {
      projects: projects.filter(p => 
        p.name.toLowerCase().includes(keyword) || 
        p.description.toLowerCase().includes(keyword)
      ).slice(0, 3),
      tasks: tasks.filter(t => 
        t.title.toLowerCase().includes(keyword) || 
        t.description.toLowerCase().includes(keyword)
      ).slice(0, 3),
      meetings: meetings.filter(m => 
        m.title.toLowerCase().includes(keyword) ||
        m.projectName.toLowerCase().includes(keyword)
      ).slice(0, 3),
      files: files.filter(f => 
        f.name.toLowerCase().includes(keyword)
      ).slice(0, 3)
    };
  }, [searchText]);

  const totalResults = 
    searchResults.projects.length + 
    searchResults.tasks.length + 
    searchResults.meetings.length + 
    searchResults.files.length;

  const handleSearch = (keyword?: string) => {
    const text = keyword || searchText;
    if (!text.trim()) return;
    
    if (!searchHistory.includes(text)) {
      setSearchHistory(prev => [text, ...prev].slice(0, 10));
    }
  };

  const handleClearHistory = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要清空搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          setSearchHistory([]);
        }
      }
    });
  };

  const handleCancel = () => {
    Taro.navigateBack();
  };

  const highlightText = (text: string, keyword: string) => {
    if (!keyword) return text;
    const index = text.toLowerCase().indexOf(keyword.toLowerCase());
    if (index === -1) return text;
    
    return (
      <>
        <Text>{text.slice(0, index)}</Text>
        <Text className={styles.highlight}>{text.slice(index, index + keyword.length)}</Text>
        <Text>{text.slice(index + keyword.length)}</Text>
      </>
    );
  };

  return (
    <View className={styles.searchPage}>
      <View className={styles.header}>
        <View className={styles.searchInput}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.input}
            placeholder="搜索项目、任务、会议、文件..."
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
            onConfirm={() => handleSearch()}
            autoFocus
            confirmType="search"
          />
        </View>
        <Text className={styles.cancelBtn} onClick={handleCancel}>取消</Text>
      </View>

      {hasSearched && (
        <View className={styles.tabBar}>
          {tabList.map(tab => (
            <Text
              key={tab.key}
              className={classnames(styles.tabItem, activeTab === tab.key && styles.active)}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </Text>
          ))}
        </View>
      )}

      <ScrollView scrollY>
        {!hasSearched ? (
          <>
            {searchHistory.length > 0 && (
              <View className={styles.historySection}>
                <View className={styles.sectionHeader}>
                  <Text className={styles.sectionTitle}>搜索历史</Text>
                  <Text className={styles.clearBtn} onClick={handleClearHistory}>清空</Text>
                </View>
                <View className={styles.historyTags}>
                  {searchHistory.map((keyword, index) => (
                    <Text 
                      key={index} 
                      className={styles.tag}
                      onClick={() => {
                        setSearchText(keyword);
                        handleSearch(keyword);
                      }}
                    >
                      {keyword}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            <View className={styles.hotSearch}>
              <Text className={styles.sectionTitle}>热门搜索</Text>
              <View className={styles.hotList}>
                {hotKeywords.map((item, index) => (
                  <View 
                    key={index} 
                    className={styles.hotItem}
                    onClick={() => {
                      setSearchText(item.keyword);
                      handleSearch(item.keyword);
                    }}
                  >
                    <Text className={classnames(
                      styles.rank,
                      index === 0 && styles.top1,
                      index === 1 && styles.top2,
                      index === 2 && styles.top3,
                      index > 2 && styles.other
                    )}>
                      {index + 1}
                    </Text>
                    <Text className={styles.keyword}>{item.keyword}</Text>
                    {item.hot && <Text className={styles.hotBadge}>热</Text>}
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : (
          <View className={styles.searchResults}>
            {totalResults === 0 ? (
              <View className={styles.emptyState}>
                <Text className={styles.emptyIcon}>🔍</Text>
                <Text className={styles.emptyText}>未找到相关结果</Text>
              </View>
            ) : (
              <>
                {(activeTab === 'all' || activeTab === 'project') && searchResults.projects.length > 0 && (
                  <View className={styles.resultSection}>
                    <View className={styles.sectionHeader}>
                      <Text className={styles.sectionTitle}>项目</Text>
                      <Text className={styles.sectionMore}>查看全部 ›</Text>
                    </View>
                    {searchResults.projects.map(project => (
                      <View 
                        key={project.id} 
                        className={styles.resultItem}
                        onClick={() => Taro.navigateTo({ 
                          url: `/pages/project-detail/index?id=${project.id}` 
                        })}
                      >
                        <View className={styles.resultIcon}>📁</View>
                        <View className={styles.resultInfo}>
                          <Text className={styles.resultTitle}>
                            {highlightText(project.name, searchText)}
                          </Text>
                          <Text className={styles.resultDesc}>{project.memberCount}个成员 · {project.taskCount}个任务</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {(activeTab === 'all' || activeTab === 'task') && searchResults.tasks.length > 0 && (
                  <View className={styles.resultSection}>
                    <View className={styles.sectionHeader}>
                      <Text className={styles.sectionTitle}>任务</Text>
                      <Text className={styles.sectionMore}>查看全部 ›</Text>
                    </View>
                    {searchResults.tasks.map(task => (
                      <View 
                        key={task.id} 
                        className={styles.resultItem}
                        onClick={() => Taro.navigateTo({ 
                          url: `/pages/task-detail/index?id=${task.id}` 
                        })}
                      >
                        <View className={styles.resultIcon}>✅</View>
                        <View className={styles.resultInfo}>
                          <Text className={styles.resultTitle}>
                            {highlightText(task.title, searchText)}
                          </Text>
                          <Text className={styles.resultDesc}>{task.projectName} · {task.assigneeName}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {(activeTab === 'all' || activeTab === 'meeting') && searchResults.meetings.length > 0 && (
                  <View className={styles.resultSection}>
                    <View className={styles.sectionHeader}>
                      <Text className={styles.sectionTitle}>会议</Text>
                      <Text className={styles.sectionMore}>查看全部 ›</Text>
                    </View>
                    {searchResults.meetings.map(meeting => (
                      <View 
                        key={meeting.id} 
                        className={styles.resultItem}
                        onClick={() => Taro.navigateTo({ 
                          url: `/pages/meeting-detail/index?id=${meeting.id}` 
                        })}
                      >
                        <View className={styles.resultIcon}>📅</View>
                        <View className={styles.resultInfo}>
                          <Text className={styles.resultTitle}>
                            {highlightText(meeting.title, searchText)}
                          </Text>
                          <Text className={styles.resultDesc}>{meeting.projectName} · {meeting.location}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {(activeTab === 'all' || activeTab === 'file') && searchResults.files.length > 0 && (
                  <View className={styles.resultSection}>
                    <View className={styles.sectionHeader}>
                      <Text className={styles.sectionTitle}>文件</Text>
                      <Text className={styles.sectionMore}>查看全部 ›</Text>
                    </View>
                    {searchResults.files.map(file => (
                      <View 
                        key={file.id} 
                        className={styles.resultItem}
                      >
                        <View className={styles.resultIcon}>📄</View>
                        <View className={styles.resultInfo}>
                          <Text className={styles.resultTitle}>
                            {highlightText(file.name, searchText)}
                          </Text>
                          <Text className={styles.resultDesc}>{file.size} · {file.uploaderName}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SearchPage;
