import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Spin } from "antd";
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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!stats) {
          setLoading(true);
        }
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
    };

    fetchStats();
  }, [location.pathname, selectedGroup, relativeTimeMs]);

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
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="题目数量"
              value={stats.problem_count}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: "#f5222d" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="参赛队伍"
              value={stats.team_count}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总提交数"
              value={stats.run_count}
              prefix={<FileOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="通过提交"
              value={stats.accepted_count}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StatsPanel;
