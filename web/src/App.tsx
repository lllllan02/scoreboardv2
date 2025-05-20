import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Home from './pages/Home';
import Contest from './pages/Contest';

// 导入全局样式
import 'antd/dist/reset.css';

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN} theme={{ token: { colorPrimary: '#1890ff' } }}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/*" element={<Contest />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App; 