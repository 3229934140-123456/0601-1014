import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useAppStore';
import { FileItem, Task } from '@/types';
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
  const filterParam = (router.params.filter as FilterType) || 'all';
  const isAllProjects = projectId === 'all';
  
  const [filterType, setFilterType] = useState<FilterType>(filterParam);
  
  const getFilesByProject = useAppStore(state => state.getFilesByProject);
  const getMyFavoriteFiles = useAppStore(state => state.getMyFavoriteFiles);
  const toggleFileFavorite = useAppStore(state => state.toggleFileFavorite);
  const addFile = useAppStore(state => state.addFile);
  const addTaskAttachment = useAppStore(state => state.addTaskAttachment);
  const getCurrentUser = useAppStore(state => state.getCurrentUser);
  const getProjectById = useAppStore(state => state.getProjectById);
  const getTasksByProject = useAppStore(state => state.getTasksByProject);
  const getMyProjects = useAppStore(state => state.getMyProjects);
  const currentUserId = useAppStore(state => state.currentUserId);

  const currentUser = getCurrentUser();
  const project = !isAllProjects ? getProjectById(projectId) : null;
  const myProjects = useMemo(() => getMyProjects(currentUserId), [getMyProjects, currentUserId]);
  const projectTasks = useMemo(() => {
    if (isAllProjects) return [];
    return getTasksByProject(projectId);
  }, [getTasksByProject, projectId, isAllProjects]);

  const allFiles = useMemo(() => {
    if (isAllProjects) {
      return getMyFavoriteFiles();
    }
    return getFilesByProject(projectId);
  }, [getFilesByProject, getMyFavoriteFiles, projectId, isAllProjects]);

  const filteredFiles = useMemo(() => {
    let result = allFiles;
    if (filterType === 'favorite') {
      result = result.filter(f => f.isFavorite);
    } else if (filterType === 'doc') {
      result = result.filter(f => ['doc', 'pdf', 'excel', 'ppt'].includes(f.type));
    } else if (filterType === 'design') {
      result = result.filter(f => f.type === 'design');
    }
    return result;
  }, [allFiles, filterType]);

  useEffect(() => {
    if (filterParam) {
      setFilterType(filterParam);
    }
  }, [filterParam]);

  const getProjectName = (projId: string) => {
    const proj = getProjectById(projId);
    return proj?.name || '未知项目';
  };

  const handleFileClick = (file: FileItem) => {
    Taro.showToast({ title: `打开 ${file.name}`, icon: 'none' });
  };

  const handleToggleFavorite = (fileId: string, e: any) => {
    e.stopPropagation?.();
    const file = allFiles.find(f => f.id === fileId);
    toggleFileFavorite(fileId);
    Taro.showToast({ 
      title: file?.isFavorite ? '已取消收藏' : '已收藏', 
      icon: 'success' 
    });
  };

  const handleUpload = () => {
    if (isAllProjects) {
      Taro.showActionSheet({
        itemList: myProjects.map(p => p.name),
        success: (res) => {
          const selectedProject = myProjects[res.tapIndex];
          showUploadOptions(selectedProject.id, selectedProject.name);
        }
      });
      return;
    }
    showUploadOptions(projectId, project?.name || '');
  };

  const showUploadOptions = (projId: string, projName: string) => {
    const tasks = getTasksByProject(projId);
    
    Taro.showActionSheet({
      itemList: ['只关联项目', '关联到任务...'],
      success: (res) => {
        if (res.tapIndex === 0) {
          showFilePicker(projId);
        } else {
          if (tasks.length === 0) {
            Taro.showToast({ title: '该项目暂无任务', icon: 'none' });
            return;
          }
          Taro.showActionSheet({
            itemList: tasks.map(t => t.title),
            success: (taskRes) => {
              const task = tasks[taskRes.tapIndex];
              showFilePicker(projId, task.id);
            }
          });
        }
      }
    });
  };

  const showFilePicker = (projId: string, taskId?: string) => {
    const mockFiles = [
      { name: '新上传文档.docx', type: 'doc', size: '1.2MB' },
      { name: '设计稿.png', type: 'design', size: '2.5MB' },
      { name: '数据表.xlsx', type: 'excel', size: '800KB' }
    ];

    Taro.showActionSheet({
      itemList: mockFiles.map(f => f.name),
      success: (res) => {
        const file = mockFiles[res.tapIndex];
        const fileData = {
          name: file.name,
          type: file.type,
          size: file.size,
          url: '#',
          uploaderId: currentUser?.id || '',
          uploaderName: currentUser?.name || '',
          projectId: projId,
          taskId: taskId
        };

        if (taskId) {
          addTaskAttachment(taskId, fileData as Omit<FileItem, 'id' | 'uploadTime' | 'isFavorite'>);
          Taro.showToast({ title: '已添加到任务附件', icon: 'success' });
        } else {
          addFile(fileData as Omit<FileItem, 'id' | 'uploadTime' | 'isFavorite'>);
          Taro.showToast({ title: '上传成功', icon: 'success' });
        }
      }
    });
  };

  const handleSearch = () => {
    Taro.navigateTo({ url: '/pages/search/index?type=file' });
  };

  const headerTitle = isAllProjects ? '我的收藏' : (project?.name || '项目文件');
  const headerSubtitle = isAllProjects 
    ? `共 ${filteredFiles.length} 个收藏文件`
    : `共 ${allFiles.length} 个文件`;

  return (
    <View className={styles.filesPage}>
      <View className={styles.header}>
        <Text className={styles.projectName}>{headerTitle}</Text>
        <Text className={styles.fileCount}>{headerSubtitle}</Text>
      </View>

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
                {isAllProjects && (
                  <View className={styles.fileProject}>
                    <Text className={styles.projectTag}>{getProjectName(file.projectId)}</Text>
                  </View>
                )}
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
            <Text className={styles.emptyText}>
              {filterType === 'favorite' ? '暂无收藏文件' : '暂无文件'}
            </Text>
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
