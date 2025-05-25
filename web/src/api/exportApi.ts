import { message } from 'antd';

/**
 * 导出比赛排名数据
 * @param path 比赛路径
 * @param format 导出格式
 * @param group 分组
 * @param t 时间点
 */
export const exportContestRank = async (
  path: string,
  format: string,
  group?: string,
  t?: number
) => {
  try {
    // 构建查询参数
    const params = new URLSearchParams();
    params.append('format', format);
    if (group && group !== 'all') {
      params.append('group', group);
    }
    if (t) {
      params.append('t', t.toString());
    }

    // 发送请求
    const response = await fetch(`/api/export${path}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('导出失败');
    }

    // 获取文件名
    const contentDisposition = response.headers.get('content-disposition');
    let filename = 'export';
    if (contentDisposition) {
      // 处理文件名，支持 UTF-8 编码和 Base64 编码
      const filenameMatch = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i.exec(contentDisposition);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
        
        // 处理 UTF-8 编码
        if (filename.startsWith('=?UTF-8?B?')) {
          // Base64 编码
          filename = filename.replace(/=\?UTF-8\?B\?(.*?)\?=/g, (match, p1) => {
            try {
              return atob(p1);
            } catch (e) {
              return p1;
            }
          });
        } else if (filename.startsWith('=?UTF-8?Q?')) {
          // Quoted-printable 编码
          filename = filename.replace(/=\?UTF-8\?Q\?(.*?)\?=/g, (match, p1) => {
            try {
              return decodeURIComponent(p1.replace(/=([0-9A-F]{2})/g, '%$1'));
            } catch (e) {
              return p1;
            }
          });
        } else {
          // URL 编码
          try {
            filename = decodeURIComponent(filename);
          } catch (e) {
            console.warn('Failed to decode filename:', e);
          }
        }
      }
    }

    // 添加文件扩展名（如果没有）
    if (!filename.includes('.')) {
      filename += `.${format}`;
    }

    // 下载文件
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    message.success('导出成功');
  } catch (error) {
    console.error('导出失败:', error);
    message.error('导出失败');
  }
};