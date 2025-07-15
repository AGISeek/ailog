/**
 * 统计数据卡片组件
 */

import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { useTranslation } from 'react-i18next';
import type { CommitStatistics } from '@ailog/shared';
import styles from './index.module.css';

interface StatisticsCardsProps {
  statistics: CommitStatistics;
  loading: boolean;
}

export const StatisticsCards: React.FC<StatisticsCardsProps> = ({
  statistics,
  loading,
}) => {
  const { t } = useTranslation();

  return (
    <Row gutter={[16, 16]} className={styles.container}>
      <Col xs={24} sm={12} md={6}>
        <Card 
          loading={loading}
          className={loading ? styles.loadingCard : styles.card}
        >
          <Statistic
            title={t('statistics.totalCommits')}
            value={statistics.totalCommits}
            className={`${styles.statistic} ${styles.totalStatistic}`}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card 
          loading={loading}
          className={loading ? styles.loadingCard : styles.card}
        >
          <Statistic
            title={t('statistics.aiCommits')}
            value={statistics.aiCommits}
            className={`${styles.statistic} ${styles.aiStatistic}`}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card 
          loading={loading}
          className={loading ? styles.loadingCard : styles.card}
        >
          <Statistic
            title={t('statistics.totalLines')}
            value={statistics.totalLines}
            className={`${styles.statistic} ${styles.totalStatistic}`}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card 
          loading={loading}
          className={loading ? styles.loadingCard : styles.card}
        >
          <Statistic
            title={t('statistics.aiLines')}
            value={statistics.aiLines}
            className={`${styles.statistic} ${styles.aiStatistic}`}
          />
        </Card>
      </Col>
    </Row>
  );
};