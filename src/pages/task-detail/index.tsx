import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Input } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { tasks } from '@/data/tasks';
import { Task, TaskStatus } from '@/types';
import StatusTag from '@/components/StatusTag';
import { formatDate, formatDateTime, isOverdue } from '@/utils';

const statusOptions: { key: TaskStatus; label: string }[] = [
  { key: 'todo', label: '待开始' },
  { key: 'in_progress', label: '进行中' },
  { key: 'review', label: '待审核' },
  { key: 'done', label: '已完成' }
];

const TaskDetailPage: React.FC = () => {
  const router = useRouter();
  const taskId = router.params.id || 't2';
  const task = tasks.find(t => t.id === taskId) || tasks[0];

  const [currentTask, setCurrentTask] = useState<Task>(task);
  const [commentText, setCommentText] = useState('');

  const overdue = isOverdue(currentTask.dueDate) && currentTask.status !== 'done';

  const handleStatusChange = (status: TaskStatus) => {
    if (status === 'done' && currentTask.status !== 'done') {
      Taro.showModal({
        title: '完成任务',
        content: '请输入完成说明',
        editable: true,
        placeholderText: '请输入完成说明...',
        success: (res) => {
          if (res.confirm) {
            setCurrentTask(prev => ({
              ...prev,
              status,
              completedAt: new Date().toISOString(),
              completionNote: res.content || '任务已完成'
            }));
            Taro.showToast({ title: '任务已完成', icon: 'success' });
          }
        }
      });
    } else {
      setCurrentTask(prev => ({ ...prev, status }));
    }
  };

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    
    const newComment = {
      id: `c${Date.now()}`,
      content: commentText,
      authorId: 'm1',
      authorName: '张明',
      authorAvatar: 'https://picsum.photos/id/64/200/200',
      createdAt: new Date().toISOString()
    };

    setCurrentTask(prev => ({
      ...prev,
      comments: [...prev.comments, newComment]
    }));
    setCommentText('');
    Taro.showToast({ title: '评论成功', icon: 'success' });
  };

  const handleChangeAssignee = () => {
    Taro.showToast({ title: '更换负责人', icon: 'none' });
  };

  const handleAddAttachment = () => {
    Taro.showToast({ title: '添加附件', icon: 'none' });
  };

  const handleEdit = () => {
    Taro.showToast({ title: '编辑任务', icon: 'none' });
  };

  const handleDelete = () => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个任务吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已删除', icon: 'success' });
          setTimeout(() => Taro.navigateBack(), 1000);
        }
      }
    });
  };

  return (
    <View className={styles.taskDetailPage}>
      <ScrollView scrollY>
        <View className={styles.taskHeader}>
          <Text className={styles.taskTitle}>{currentTask.title}</Text>
          <View className={styles.taskMeta}>
            <View className={styles.metaItem}>
              <Text className={styles.metaIcon}>📁</Text>
              <Text>{currentTask.projectName}</Text>
            </View>
            <View className={styles.metaItem}>
              <Text className={styles.metaIcon}>⏰</Text>
              <Text style={{ color: overdue ? '#F53F3F' : undefined }}>
                {formatDate(currentTask.dueDate)}
                {overdue && ' (已逾期)'}
              </Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>任务状态</Text>
          <View className={styles.statusSelector}>
            {statusOptions.map(option => (
              <Text
                key={option.key}
                className={classnames(styles.statusOption, currentTask.status === option.key && styles.active)}
                onClick={() => handleStatusChange(option.key)}
              >
                {option.label}
              </Text>
            ))}
          </View>
        </View>

        {currentTask.completionNote && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>完成说明</Text>
            <View className={styles.completionNote}>
              <Text className={styles.noteTitle}>✅ 任务完成</Text>
              <Text className={styles.noteContent}>{currentTask.completionNote}</Text>
            </View>
          </View>
        )}

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>任务描述</Text>
          <Text className={styles.description}>{currentTask.description}</Text>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>负责人</Text>
          <View className={styles.assigneeSection} onClick={handleChangeAssignee}>
            <View className={styles.avatar}>
              <Image src={currentTask.assigneeAvatar} mode="aspectFill" />
            </View>
            <View className={styles.info}>
              <Text className={styles.name}>{currentTask.assigneeName}</Text>
              <Text className={styles.role}>点击更换负责人</Text>
            </View>
            <Text className={styles.changeBtn}>更换 ›</Text>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text>附件 ({currentTask.attachments.length})</Text>
            <Text className={styles.sectionAction} onClick={handleAddAttachment}>添加</Text>
          </View>
          {currentTask.attachments.length > 0 ? (
            <View className={styles.attachmentList}>
              {currentTask.attachments.map(file => (
                <View key={file.id} className={styles.attachmentItem}>
                  <View className={styles.fileIcon}>
                    <Text>📄</Text>
                  </View>
                  <View className={styles.fileInfo}>
                    <Text className={styles.fileName}>{file.name}</Text>
                    <Text className={styles.fileSize}>{file.size}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={{ fontSize: '24rpx', color: '#86909c' }}>暂无附件</Text>
          )}
        </View>

        <View className={`${styles.section} ${styles.commentSection}`}>
          <View className={styles.commentHeader}>
            <Text className={styles.commentTitle}>评论</Text>
            <Text className={styles.commentCount}>{currentTask.comments.length}条</Text>
          </View>
          
          {currentTask.comments.length > 0 ? (
            <View className={styles.commentList}>
              {currentTask.comments.map(comment => (
                <View key={comment.id} className={styles.commentItem}>
                  <View className={styles.avatar}>
                    <Image src={comment.authorAvatar} mode="aspectFill" />
                  </View>
                  <View className={styles.commentContent}>
                    <View className={styles.commentHeader}>
                      <Text className={styles.author}>{comment.authorName}</Text>
                      <Text className={styles.time}>{formatDateTime(comment.createdAt)}</Text>
                    </View>
                    <Text className={styles.commentText}>{comment.content}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={{ fontSize: '24rpx', color: '#86909c', textAlign: 'center', padding: '20rpx 0' }}>
              暂无评论，快来抢沙发吧~
            </Text>
          )}

          <View className={styles.commentInput}>
            <Input
              className={styles.input}
              placeholder="输入评论，可@成员..."
              value={commentText}
              onInput={(e) => setCommentText(e.detail.value)}
              onConfirm={handleSendComment}
            />
            <View className={styles.sendBtn} onClick={handleSendComment}>
              <Text>发送</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={`${styles.btn} ${styles.secondary}`} onClick={handleEdit}>
          <Text>编辑</Text>
        </View>
        <View className={`${styles.btn} ${styles.primary}`} onClick={handleDelete}>
          <Text>删除</Text>
        </View>
      </View>
    </View>
  );
};

export default TaskDetailPage;
