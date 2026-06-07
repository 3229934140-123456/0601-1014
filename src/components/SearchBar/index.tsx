import React, { useState } from 'react';
import { View, Text, Input } from '@tarojs/components';
import styles from './index.module.scss';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  showCancel?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = '搜索',
  value,
  onChange,
  onSearch,
  showCancel = false
}) => {
  const [inputValue, setInputValue] = useState(value || '');

  const handleInput = (e: any) => {
    const val = e.detail.value;
    setInputValue(val);
    onChange?.(val);
  };

  const handleConfirm = (e: any) => {
    onSearch?.(e.detail.value);
  };

  return (
    <View className={styles.searchBar}>
      <Text className={styles.searchIcon}>🔍</Text>
      <Input
        className={styles.searchInput}
        placeholder={placeholder}
        value={inputValue}
        onInput={handleInput}
        onConfirm={handleConfirm}
        confirmType="search"
      />
      {showCancel && <Text className={styles.cancelBtn}>取消</Text>}
    </View>
  );
};

export default SearchBar;
