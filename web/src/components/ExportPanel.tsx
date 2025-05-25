import React, { useState } from 'react';
import { Select, Button, message } from 'antd';
import { useLocation } from 'react-router-dom';
import { exportContestRank } from '../api/exportApi';
import '../styles/ExportPanel.css';

interface ExportPanelProps {
  group: string;
  relativeTimeMs: number | null;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ group, relativeTimeMs }) => {
  const [format, setFormat] = useState('excel');
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  // 处理导出
  const handleExport = async () => {
    try {
      setLoading(true);
      await exportContestRank(
        location.pathname,
        format,
        group,
        relativeTimeMs ?? undefined
      );
    } finally {
      setLoading(false);
    }
  };

  // 处理复制到剪贴板
  const handleCopy = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/export${location.pathname}?format=json${
          group && group !== 'all' ? `&group=${group}` : ''
        }${relativeTimeMs ? `&t=${relativeTimeMs}` : ''}`
      );

      if (!response.ok) {
        throw new Error('获取数据失败');
      }

      const data = await response.text();
      await navigator.clipboard.writeText(data);
      message.success('已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
      message.error('复制失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="export-panel">
      <div className="export-container">
        <Select
          className="export-select"
          value={format}
          onChange={setFormat}
          style={{ width: '100%' }}
          options={[
            { value: 'excel', label: 'Excel格式(xlsx)' },
            { value: 'csv', label: 'CSV格式(csv)' },
            { value: 'json', label: 'JSON格式(json)' },
          ]}
        />
        <div className="export-buttons">
          <Button 
            type="primary" 
            className="export-button" 
            onClick={handleExport}
            loading={loading}
            style={{ backgroundColor: '#0C6A6A', borderColor: '#0C6A6A' }}
          >
            下载
          </Button>
          <Button 
            type="primary" 
            onClick={handleCopy}
            loading={loading}
            style={{ backgroundColor: '#0C6A6A', borderColor: '#0C6A6A' }}
          >
            复制到剪贴板
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportPanel; 