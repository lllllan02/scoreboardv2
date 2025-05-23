import React, { useEffect, useState, useCallback } from "react";
import { Card, Row, Col, Statistic, Spin, Typography } from "antd";
import { ContestConfig } from "../types/contest";
import { Stat } from "../types/stat";
import { getContestStats } from "../api/statsApi";
import { useLocation } from "react-router-dom";
import {
  TeamOutlined,
  TrophyOutlined,
  FileOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import SubmissionTimeline from "./SubmissionTimeline";

const { Title } = Typography;

// 统计卡片组件
const StatisticCard = React.memo(({ title, value, prefix, color }: {
  title: string;
  value?: number;
  prefix: React.ReactNode;
  color: string;
}) => (
  <Col xs={24} sm={12} md={6}>
    <Card>
      <Statistic
        title={title}
        value={value}
        prefix={prefix}
        valueStyle={{ color }}
      />
    </Card>
  </Col>
));

// 统计卡片组
const StatisticCards = React.memo(({ stats }: { stats: Stat | null }) => (
  <Row gutter={[16, 16]}>
    <StatisticCard
      title="题目数量"
      value={stats?.problem_count}
      prefix={<TrophyOutlined />}
      color="#f5222d"
    />
    <StatisticCard
      title="参赛队伍"
      value={stats?.team_count}
      prefix={<TeamOutlined />}
      color="#1890ff"
    />
    <StatisticCard
      title="总提交数"
      value={stats?.run_count}
      prefix={<FileOutlined />}
      color="#faad14"
    />
    <StatisticCard
      title="通过提交"
      value={stats?.accepted_count}
      prefix={<CheckCircleOutlined />}
      color="#52c41a"
    />
  </Row>
));

// 时间轴组件
const TimelineSection = React.memo(({ 
  data, 
  contestConfig, 
  showProblemId = true 
}: { 
  data: any;
  contestConfig: ContestConfig;
  showProblemId?: boolean;
}) => (
  <SubmissionTimeline
    data={data}
    showProblemId={showProblemId}
    contestConfig={contestConfig}
  />
));

interface StatsPanelProps {
  contestConfig: ContestConfig;
  selectedGroup: string;
  relativeTimeMs: number | null;
}

const StatsPanel: React.FC<StatsPanelProps> = ({
  contestConfig,
  selectedGroup,
  relativeTimeMs,
}) => {
  const [stats, setStats] = useState<Stat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getContestStats(
        location.pathname,
        selectedGroup,
        relativeTimeMs ?? undefined
      );
      setStats(data);
    } catch (err) {
      console.error("获取统计数据失败:", err);
      setError("获取统计数据失败");
    } finally {
      setLoading(false);
    }
  }, [location.pathname, selectedGroup, relativeTimeMs]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading && !stats) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div style={{ padding: "24px", textAlign: "center", color: "#ff4d4f" }}>
        {error}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div style={{ padding: "24px" }}>
      <StatisticCards stats={stats} />

      <Card style={{ marginTop: 24 }}>
        <Title level={4}>总体提交时间轴</Title>
        <TimelineSection
          data={stats.contest_heatmap.total}
          contestConfig={contestConfig}
          showProblemId={false}
        />
      </Card>

      <Card style={{ marginTop: 24 }}>
        <Title level={4}>各题目提交时间轴</Title>
        {stats.contest_heatmap.problems.map((problem) => (
          <TimelineSection
            key={problem.problem_id}
            data={problem}
            contestConfig={contestConfig}
          />
        ))}
      </Card>
    </div>
  );
};

export default React.memo(StatsPanel);
