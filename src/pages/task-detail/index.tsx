import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView, Input } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useAppStore';
import { Task, TaskStatus, FileItem } from '@/types';
import StatusTag from '@/components/StatusTag';
import { formatDate, formatDateTime, isOverdue, generateId } from '@/utils';

const statusOptions: { key: TaskStatus; label: string }[] = [
  { key: 'todo', label: '待开始' },
  { key: 'in_progress', label: '进行中' },
  { key: 'review', label: '待审核' },
  { key: 'done', label: '已完成' }
];

const TaskDetailPage: React.FC = () => {
  const router = useRouter();
  const taskId = router.params.id || 't2';
  
  const task = useAppStore(state => state.getTaskById(taskId));
  const members = useAppStore(state => state.members);
  const currentUserId = useAppStore(state => state.currentUserId);
  const getCurrentUser = useAppStore(state => state.getCurrentUser);
  const updateTaskStatus = useAppStore(state => state.updateTaskStatus);
  const updateTaskAssignee = useAppStore(state => state.updateTaskAssignee);
  const addTaskComment = useAppStore(state => state.addTaskComment);
  const addTaskAttachment = useAppStore(state => state.addTaskAttachment);

  const currentUser = getCurrentUser();
  const [commentText, setCommentText] = useState('');
  const [showMentionPicker, setShowMentionPicker] = useState(false);

  const overdue = task ? isOverdue(task.dueDate) && task.status !== 'done' : false;

  if (!task) {
    return (
      <View className={styles.taskDetailPage}>
        <View style={{ padding: '100rpx', textAlign: 'center' }}>
          <Text>任务不存在</Text>
        </View>
      </View>
    );
  }

  const handleStatusChange = (status: TaskStatus) => {
    if (status === task.status) return;
    
    if (status === 'done') {
      Taro.showModal({
        title: '完成任务',
        content: '请输入完成说明',
        editable: true,
        placeholderText: '请输入完成说明...',
        success: (res) => {
          if (res.confirm) {
            updateTaskStatus(task.id, 'done', res.content || '任务已完成');
            Taro.showToast({ title: '任务已完成', icon: 'success' });
          }
        }
      });
    } else {
      updateTaskStatus(task.id, status);
      Taro.showToast({ title: '状态已更新', icon: 'success' });
    }
  };

  const handleChangeAssignee = () => {
    Taro.showActionSheet({
      itemList: members.map(m => m.name),
      success: (res) => {
        const selectedMember = members[res.tapIndex];
        if (selectedMember.id !== task.assigneeId) {
          updateTaskAssignee(task.id, selectedMember.id, selectedMember.name, selectedMember.avatar);
          Taro.showToast({ title: '负责人已更新', icon: 'success' });
        }
      }
    });
  };

  const handleAddAttachment = () => {
    const mockFiles = [
      { name: '需求文档.pdf', type: 'pdf', size: '2.3MB' },
      { name: '设计稿.png', type: 'image', size: '1.8MB' },
      { name: '会议纪要.docx', type: 'doc', size: '540KB' }
    ];
    
    Taro.showActionSheet({
      itemList: mockFiles.map(f => f.name),
      success: (res) => {
        const file = mockFiles[res.tapIndex];
        const result = addTaskAttachment(task.id, {
          name: file.name,
          type: file.type,
          size: file.size,
          url: '#',
          uploaderId: currentUserId,
          uploaderName: currentUser?.name || '',
          projectId: task.projectId
        });
        
        if (result) {
          if (result.isDuplicate && !result.wasAttached) {
            Taro.showToast({ title: '文件已在附件中', icon: 'none' });
          } else if (result.isDuplicate && result.wasAttached) {
            Taro.showToast({ title: '已添加已有文件', icon: 'success' });
          } else {
            Taro.showToast({ title: '附件已添加', icon: 'success' });
          }
        }
      }
    });
  };

  const handleMention = (memberName: string) => {
    setCommentText(prev => prev + `@${memberName} `);
    setShowMentionPicker(false);
  };

  const parseMentions = (content: string): string[] => {
    const mentionRegex = /@(\S+)/g;
    const mentions: string[] = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      const mentionedName = match[1];
      const mentionedMember = members.find(m => m.name === mentionedName);
      if (mentionedMember) {
        mentions.push(mentionedMember.id);
      }
    }
    
    return [...new Set(mentions)];
  };

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    
    const mentions = parseMentions(commentText.trim());
    
    addTaskComment(task.id, {
      content: commentText.trim(),
      authorId: currentUserId,
      authorName: currentUser?.name || '',
      authorAvatar: currentUser?.avatar || '',
      mentions
    });
    
    setCommentText('');
    Taro.showToast({ title: '评论成功', icon: 'success' });
  };

  const handleEdit = () => {
    Taro.showToast({ title: '编辑功能开发中', icon: 'none' });
  };

  const handleDelete = () => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个任务吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '删除功能开发中', icon: 'none' });
        }
      }
    });
  };

  return (
    <View className={styles.taskDetailPage}>
      <ScrollView scrollY>
        <View className={styles.taskHeader}>
          <Text className={styles.taskTitle}>{task.title}</Text>
          <View className={styles.taskMeta}>
            <View className={styles.metaItem}>
              <Text className={styles.metaIcon}>📁</Text>
              <Text>{task.projectName}</Text>
            </View>
            <View className={styles.metaItem}>
              <Text className={styles.metaIcon}>⏰</Text>
              <Text style={{ color: overdue ? '#F53F3F' : undefined }}>
                {formatDate(task.dueDate)}
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
                className={classnames(styles.statusOption, task.status === option.key && styles.active)}
                onClick={() => handleStatusChange(option.key)}
              >
                {option.label}
              </Text>
            ))}
          </View>
        </View>

        {task.completionNote && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>完成说明</Text>
            <View className={styles.completionNote}>
              <Text className={styles.noteTitle}>✅ 任务完成</Text>
              <Text className={styles.noteContent}>{task.completionNote}</Text>
            </View>
          </View>
        )}

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>任务描述</Text>
          <Text className={styles.description}>{task.description}</Text>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>负责人</Text>
          <View className={styles.assigneeSection} onClick={handleChangeAssignee}>
            <View className={styles.avatar}>
              <Image src={task.assigneeAvatar} mode="aspectFill" />
            </View>
            <View className={styles.info}>
              <Text className={styles.name}>{task.assigneeName}</Text>
              <Text className={styles.role}>点击更换负责人</Text>
            </View>
            <Text className={styles.changeBtn}>更换 ›</Text>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text>附件 ({task.attachments.length})</Text>
            <Text className={styles.sectionAction} onClick={handleAddAttachment}>添加</Text>
          </View>
          {task.attachments.length > 0 ? (
            <View className={styles.attachmentList}>
              {task.attachments.map(file => (
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
            <Text style={{ fontSize: '24rpx', color: '#86909c' }}>暂无附件，点击上方添加</Text>
          )}
        </View>

        <View className={`${styles.section} ${styles.commentSection}`}>
          <View className={styles.commentHeader}>
            <Text className={styles.commentTitle}>评论</Text>
            <Text className={styles.commentCount}>{task.comments.length}条</Text>
          </View>
          
          {task.comments.length > 0 ? (
            <View className={styles.commentList}>
              {task.comments.map(comment => (
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
            <View className={styles.mentionBtn} onClick={() => setShowMentionPicker(!showMentionPicker)}>
              <Text>@</Text>
            </View>
            <View className={styles.sendBtn} onClick={handleSendComment}>
              <Text>发送</Text>
            </View>
          </View>

          {showMentionPicker && (
            <View className={styles.mentionPicker}>
              <ScrollView scrollY style={{ maxHeight: '300rpx' }}>
                {members.map(member => (
                  <View 
                    key={member.id} 
                    className={styles.mentionItem}
                    onClick={() => handleMention(member.name)}
                  >
                    <Image src={member.avatar} className={styles.mentionAvatar} mode="aspectFill" />
                    <Text className={styles.mentionName}>{member.name}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
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
