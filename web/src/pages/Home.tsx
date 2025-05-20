import React, { useState, useEffect } from 'react';
import { Typography, Input, Row, Col, Empty, Spin, Alert } from 'antd';
import { SearchOutlined, TrophyOutlined } from '@ant-design/icons';
import InfiniteScroll from 'react-infinite-scroll-component';
import ContestCard from '../components/ContestCard';
import { getContestList } from '../api/contestApi';
import { Contest } from '../types/contest';
import '../styles/HomePage.css';

const { Title } = Typography;
const { Search } = Input;

// 每次加载的比赛数量
const ITEMS_PER_PAGE = 5;

const HomePage: React.FC = () => {
  const [allContests, setAllContests] = useState<Contest[]>([]);
  const [visibleContests, setVisibleContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const [hasMore, setHasMore] = useState<boolean>(true);

  // 获取比赛列表数据
  const fetchContestList = async (searchName: string = '') => {
    setLoading(true);
    try {
      const data = await getContestList(searchName);
      console.log('获取到的数据:', data);
      setAllContests(data);
      setError('');
      
      // 初始只加载部分数据
      setHasMore(data.length > ITEMS_PER_PAGE);
      setVisibleContests(data.slice(0, ITEMS_PER_PAGE));
      
    } catch (err) {
      console.error(err);
      setError('获取比赛列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 加载更多数据
  const loadMoreData = () => {
    if (!hasMore) return;
    
    // 模拟加载延迟，更好的用户体验
    setTimeout(() => {
      const currentLength = visibleContests.length;
      const nextItems = allContests.slice(
        currentLength, 
        currentLength + ITEMS_PER_PAGE
      );
      
      setVisibleContests([...visibleContests, ...nextItems]);
      
      // 检查是否还有更多数据
      setHasMore(currentLength + ITEMS_PER_PAGE < allContests.length);
    }, 500);
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

      {loading && visibleContests.length === 0 ? (
        <div className="loading-container">
          <Spin spinning={true} size="large">
            <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>
          </Spin>
        </div>
      ) : visibleContests.length > 0 ? (
        <InfiniteScroll
          dataLength={visibleContests.length}
          next={loadMoreData}
          hasMore={hasMore}
          loader={
            <div key="loader" className="loading-more-container">
              <Spin spinning={true}>
                <div style={{ padding: '20px', textAlign: 'center' }}>加载更多...</div>
              </Spin>
            </div>
          }
          endMessage={
            <p key="end-message" className="end-message">
              已经到底啦 ~
            </p>
          }
        >
          <Row gutter={[16, 16]}>
            {visibleContests.map((contest, index) => (
              <Col xs={24} sm={24} md={24} key={`${contest.config.contest_id || ''}-${index}`}>
                <ContestCard contest={contest} />
              </Col>
            ))}
          </Row>
        </InfiniteScroll>
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