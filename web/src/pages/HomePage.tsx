import React, { useState, useEffect } from 'react';
import { Typography, Input, Row, Col, Empty, Spin, Alert } from 'antd';
import { SearchOutlined, TrophyOutlined } from '@ant-design/icons';
import ContestCard from '../components/ContestCard';
import { getContestList } from '../api/contestApi';
import { Contest } from '../types/contest';
import '../styles/HomePage.css';

const { Title } = Typography;
const { Search } = Input;

const HomePage: React.FC = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');

  // 获取比赛列表数据
  const fetchContestList = async (searchName: string = '') => {
    setLoading(true);
    try {
      const data = await getContestList(searchName);
      console.log('获取到的数据:', data); // 添加调试日志
      setContests(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('获取比赛列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 组件加载时获取数据
  useEffect(() => {
    fetchContestList();
  }, []);

  // 搜索处理
  const handleSearch = (value: string) => {
    setSearchText(value);
    fetchContestList(value);
  };

  
  return (
    <div className="home-container">
      <div className="header-container">
        <TrophyOutlined className="header-icon" />
        <Title level={2} className="header-title">Scoreboard V2</Title>
      </div>

      <Search
        placeholder="Search..."
        enterButton={<SearchOutlined />}
        size="large"
        onSearch={handleSearch}
        className="search-container"
        allowClear
      />

      {error && (
        <Alert 
          message="Error" 
          description={error} 
          type="error" 
          showIcon 
          className="error-message"
        />
      )}

      {loading ? (
        <div className="loading-container">
          <Spin size="large" tip="Loading..." />
        </div>
      ) : contests && contests.length > 0 ? (
        <Row gutter={[16, 16]}>
          {contests.map(contest => (
            <Col xs={24} sm={12} md={8} key={contest.config.contestId}>
              <ContestCard contest={contest} />
            </Col>
          ))}
        </Row>
      ) : (
        <Empty 
          description={searchText ? `没有找到包含"${searchText}"的比赛` : "暂无比赛数据"} 
          className="empty-container"
        />
      )}
    </div>
  );
};

export default HomePage; 