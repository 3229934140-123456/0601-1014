import React from 'react';
import { View, Image, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { Member } from '@/types';

interface MemberAvatarProps {
  member?: Member;
  avatar?: string;
  name?: string;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
}

const MemberAvatar: React.FC<MemberAvatarProps> = ({
  member,
  avatar,
  name,
  size = 'medium',
  showName = false
}) => {
  const avatarUrl = member?.avatar || avatar || '';
  const displayName = member?.name || name || '';

  return (
    <View className={classnames(styles.memberAvatar, styles[size])}>
      <View className={styles.avatar}>
        {avatarUrl ? (
          <Image src={avatarUrl} mode="aspectFill" />
        ) : (
          <View style={{ width: '100%', height: '100%', backgroundColor: '#e5e6eb' }} />
        )}
      </View>
      {showName && <Text className={styles.name}>{displayName}</Text>}
    </View>
  );
};

interface AvatarGroupProps {
  members: Member[];
  max?: number;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({ members, max = 4 }) => {
  const visibleMembers = members.slice(0, max);
  const remaining = members.length - max;

  return (
    <View className={styles.avatarGroup}>
      {visibleMembers.map((member) => (
        <View key={member.id} className={styles.avatarItem}>
          <Image src={member.avatar} mode="aspectFill" />
        </View>
      ))}
      {remaining > 0 && (
        <View className={styles.moreCount}>
          <Text>+{remaining}</Text>
        </View>
      )}
    </View>
  );
};

export default MemberAvatar;
