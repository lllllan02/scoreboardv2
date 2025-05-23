import React from 'react';
import { Tooltip, Badge } from 'antd';
import { ProblemHeatmap } from '../types/stat';
import { ContestConfig } from '../types/contest';
import { getContrastColor } from '../utils/colorUtils';
import '../styles/SubmissionTimeline.css';

interface SubmissionTimelineProps {
  data: ProblemHeatmap;
  showProblemId?: boolean;
  contestConfig?: ContestConfig;
}

const formatTime = (timestamp: number) => {
  const hours = Math.floor(timestamp / 3600000);
  const minutes = Math.floor((timestamp % 3600000) / 60000);
  const seconds = Math.floor((timestamp % 60000) / 1000);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const SubmissionTimeline: React.FC<SubmissionTimelineProps> = ({ 
  data, 
  showProblemId = true,
  contestConfig 
}) => {
  // 计算最大提交次数
  const maxAcceptedCount = Math.max(...data.submissions.filter(s => s.status === 'accepted').map(s => s.count));
  const maxRejectedCount = Math.max(...data.submissions.filter(s => s.status === 'rejected').map(s => s.count));

  // 计算总提交次数
  const totalAccepted = data.submissions.filter(s => s.status === 'accepted').reduce((sum, s) => sum + s.count, 0);
  const totalRejected = data.submissions.filter(s => s.status === 'rejected').reduce((sum, s) => sum + s.count, 0);

  // 计算时间段长度
  const timeSlotDuration = data.submissions.length > 0 ? data.submissions[1].timestamp - data.submissions[0].timestamp : 0;

  // 填充空的提交记录，确保两行长度一致
  const fillEmptySubmissions = (submissions: typeof data.submissions) => {
    const allTimestamps = data.submissions.map(s => s.timestamp);
    const uniqueTimestamps = [...new Set(allTimestamps)].sort((a, b) => a - b);
    
    return uniqueTimestamps.map(timestamp => {
      const existing = submissions.find(s => s.timestamp === timestamp);
      return existing || {
        timestamp,
        count: 0,
        status: submissions[0]?.status || 'accepted'
      };
    });
  };

  const acceptedSubmissions = fillEmptySubmissions(data.submissions.filter(s => s.status === 'accepted'));
  const rejectedSubmissions = fillEmptySubmissions(data.submissions.filter(s => s.status === 'rejected'));

  // 计算题目的背景色和文字色
  const getProblemColors = () => {
    if (contestConfig?.balloon_color) {
      const index = data.problem_id.charCodeAt(0) - 65;
      const balloon = contestConfig.balloon_color[index];
      if (balloon?.background_color) {
        return {
          backgroundColor: balloon.background_color,
          color: getContrastColor(balloon.background_color)
        };
      }
    }
    return {
      backgroundColor: '#1890ff',
      color: 'white'
    };
  };

  const { backgroundColor: problemBackgroundColor, color: problemTextColor } = getProblemColors();

  const getDotStyle = (count: number, maxCount: number, status: 'accepted' | 'rejected') => {
    if (count === 0) {
      return {
        backgroundColor: 'transparent',
        opacity: 0,
        cursor: 'default'
      };
    }
    return {
      backgroundColor: status === 'accepted' ? '#52c41a' : '#ff4d4f',
      opacity: Math.max(0.2, Math.min(0.3 + (count / maxCount) * 0.7, 1)),
      cursor: 'pointer'
    };
  };

  return (
    <div className="timeline-container">
      {showProblemId && (
        <div 
          className="problem-label"
          style={{ backgroundColor: problemBackgroundColor, color: problemTextColor }}
        >
          {data.problem_id}
        </div>
      )}
      <div className="main-container">
        <div className="submission-row">
          <div className="submission-label submission-label-accepted">通过</div>
          <div className="submissions-container">
            {acceptedSubmissions.map((submission) => (
              <Tooltip 
                key={`accepted-${submission.timestamp}`}
                title={`通过 ${submission.count} 次 - ${formatTime(submission.timestamp)}${timeSlotDuration ? ` ~ ${formatTime(submission.timestamp + timeSlotDuration)}` : ''}`}
                placement="top"
              >
                <div 
                  className="submission-dot"
                  style={getDotStyle(submission.count, maxAcceptedCount, 'accepted')}
                />
              </Tooltip>
            ))}
          </div>
        </div>
        <div className="submission-row">
          <div className="submission-label submission-label-rejected">未通过</div>
          <div className="submissions-container">
            {rejectedSubmissions.map((submission) => (
              <Tooltip 
                key={`rejected-${submission.timestamp}`}
                title={`未通过 ${submission.count} 次 - ${formatTime(submission.timestamp)}${timeSlotDuration ? ` ~ ${formatTime(submission.timestamp + timeSlotDuration)}` : ''}`}
                placement="top"
              >
                <div 
                  className="submission-dot"
                  style={getDotStyle(submission.count, maxRejectedCount, 'rejected')}
                />
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
      <div className="stats-container">
        <Badge 
          count={totalAccepted} 
          showZero 
          overflowCount={999}
          style={{ 
            backgroundColor: '#52c41a',
            fontWeight: 'bold',
          }} 
        />
        <Badge 
          count={totalRejected} 
          showZero 
          overflowCount={999}
          style={{ 
            backgroundColor: '#ff4d4f',
            fontWeight: 'bold',
          }} 
        />
      </div>
    </div>
  );
};

export default SubmissionTimeline; 