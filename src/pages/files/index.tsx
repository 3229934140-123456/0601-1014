import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { files, getFilesByProject, getFavoriteFiles } from '@/data/files';
import { FileItem } from '@/types';
import { formatRelativeTime, getFileIcon } from '@/utils';

type FilterType = 'all' | 'doc' | 'design' | 'favorite';

const filterOptions: { key: FilterType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'doc', label: '文档' },
  { key: 'design', label: '设计' },
  { key: 'favorite', label: '收藏' }
];

const FilesPage: React.FC = () => {
  const router = useRouter();
  const projectId = router.params.projectId || 'p1';
  
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [fileList, setFileList] = useState<FileItem[]>(getFilesByProject(projectId));

  const filteredFiles = useMemo(() => {
    let result = fileList;
    if (filterType === 'favorite') {
      result = result.filter(f => f.isFavorite);
    } else if (filterType === 'doc') {
      result = result.filter(f => ['doc', 'pdf', 'excel', 'ppt'].includes(f.type));
    } else if (filterType === 'design') {
      result = result.filter(f => f.type === 'design');
    }
    return result;
  }, [fileList, filterType]);

  const handleFileClick = (file: FileItem) => {
    Taro.showToast({ title: `打开 ${file.name}`, icon: 'none' });
  };

  const handleToggleFavorite = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFileList(prev => 
      prev.map(f => f.id === fileId ? { ...f, isFavorite: !f.isFavorite } : f)
    );
    const file = fileList.find(f => f.id === fileId);
    if (file) {
      Taro.showToast({ 
        title: file.isFavorite ? '已取消收藏' : '已收藏', 
        icon: 'success' 
      });
    }
  };

  const handleUpload = () => {
    Taro.showToast({ title: '上传文件', icon: 'none' });
  };

  const handleSearch = () => {
    Taro.navigateTo({ url: '/pages/search/index?type=file' });
  };

  return (
    <View className={styles.filesPage}>
      <View className={styles.searchBar}>
        <View className={styles.searchInput} onClick={handleSearch}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Text className={styles.searchText}>搜索文件...</Text>
        </View>
      </View>

      <View className={styles.filterBar}>
        {filterOptions.map(option => (
          <Text
            key={option.key}
            className={classnames(styles.filterItem, filterType === option.key && styles.active)}
            onClick={() => setFilterType(option.key)}
          >
            {option.label}
          </Text>
        ))}
      </View>

      <ScrollView scrollY className={styles.fileList}>
        {filteredFiles.length > 0 ? (
          filteredFiles.map(file => (
            <View 
              key={file.id} 
              className={styles.fileItem}
              onClick={() => handleFileClick(file)}
            >
              <View className={classnames(styles.fileIcon, styles[file.type] || '')}>
                <Text>{getFileIcon(file.type)}</Text>
              </View>
              <View className={styles.fileInfo}>
                <Text className={styles.fileName}>{file.name}</Text>
                <View className={styles.fileMeta}>
                  <Text>{file.size}</Text>
                  <Text className={styles.dot}>·</Text>
                  <Text>{file.uploaderName}</Text>
                  <Text className={styles.dot}>·</Text>
                  <Text>{formatRelativeTime(file.uploadTime)}</Text>
                </View>
              </View>
              <Text 
                className={styles.favoriteBtn}
                onClick={(e) => handleToggleFavorite(file.id, e)}
              >
                {file.isFavorite ? '⭐' : '☆'}
              </Text>
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📁</Text>
            <Text className={styles.emptyText}>暂无文件</Text>
          </View>
        )}
      </ScrollView>

      <View className={styles.fabButton} onClick={handleUpload}>
        <Text className={styles.fabIcon}>⬆️</Text>
      </View>
    </View>
  );
};

export default FilesPage;
