import React from 'react';
import { Select, Button } from 'antd';
import '../styles/ExportPanel.css';

interface ExportPanelProps {
  onExport: (type: string) => void;
  onCopy: () => void;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ onExport, onCopy }) => {
  return (
    <div className="export-panel">
      <div className="export-container">
        <Select
          className="export-select"
          defaultValue="xlsx"
          style={{ width: '100%' }}
          options={[
            { value: 'xlsx', label: 'Excel表格(xlsx)' },
            { value: 'csv', label: 'CSV格式(csv)' },
            { value: 'html', label: 'HTML格式(html)' },
            { value: 'json', label: 'JSON格式(json)' },
            { value: 'dat', label: 'Codeforces Gym Ghost(dat)' },
          ]}
        />
        <div className="export-buttons">
          <Button 
            type="primary" 
            className="export-button" 
            onClick={() => onExport(document.querySelector<HTMLSelectElement>('.export-select')?.value || 'xlsx')}
            style={{ backgroundColor: '#0C6A6A', borderColor: '#0C6A6A' }}
          >
            Download
          </Button>
          <Button 
            type="primary" 
            onClick={onCopy}
            style={{ backgroundColor: '#0C6A6A', borderColor: '#0C6A6A' }}
          >
            Copy to Clipboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportPanel; 