/**
 * 筛选控制组件
 */

import React from 'react';
import { Card, Space, DatePicker, Input, Button } from 'antd';
import { SearchOutlined, ClearOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { Dayjs } from 'dayjs';
import type { CommitFilters } from '../../types';
import styles from './index.module.css';

const { RangePicker } = DatePicker;

interface FilterControlsProps {
  filters: CommitFilters;
  onFiltersChange: (filters: Partial<CommitFilters>) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  loading: boolean;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  onRefresh,
  loading,
}) => {
  const { t } = useTranslation();

  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    onFiltersChange({
      dateRange: dates && dates[0] && dates[1] ? [
        dates[0].format('YYYY-MM-DD'),
        dates[1].format('YYYY-MM-DD')
      ] : undefined
    });
  };

  return (
    <Card className={styles.container}>
      <Space wrap className={styles.filterSpace}>
        <RangePicker
          placeholder={[t('filters.startDate'), t('filters.endDate')]}
          className={styles.rangePicker}
          onChange={handleDateRangeChange}
        />
        <Input
          placeholder={t('filters.searchMessage')}
          prefix={<SearchOutlined />}
          className={styles.searchInput}
          value={filters.messageSearch}
          onChange={(e) => onFiltersChange({ messageSearch: e.target.value })}
        />
        <Button 
          icon={<ClearOutlined />} 
          onClick={onClearFilters}
          title={t('filters.clearFilters')}
          className={`${styles.actionButton} ${styles.clearButton}`}
        />
        <Button 
          icon={<ReloadOutlined />} 
          onClick={onRefresh}
          loading={loading}
          className={`${styles.actionButton} ${styles.refreshButton}`}
          title={t('actions.refresh')}
        />
      </Space>
    </Card>
  );
};