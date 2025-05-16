/**
 * 计算颜色亮度的函数，决定应该使用黑色还是白色文字
 * @param color - 颜色值，支持十六进制(#RGB 或 #RRGGBB)和 RGB/RGBA 格式
 * @returns 颜色亮度值，范围 0-1
 */
export const getLuminance = (color: string): number => {
  // 如果颜色是#开头的十六进制颜色
  if (color.startsWith('#')) {
    const hex = color.substring(1);
    // 处理三位十六进制 (#rgb)
    const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.substring(0, 2), 16);
    const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.substring(2, 4), 16);
    const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.substring(4, 6), 16);
    // 计算亮度 (参考 WCAG 标准)
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }
  
  // 如果是rgb或rgba格式
  if (color.startsWith('rgb')) {
    const values = color.match(/\d+/g);
    if (values && values.length >= 3) {
      const r = parseInt(values[0]);
      const g = parseInt(values[1]);
      const b = parseInt(values[2]);
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    }
  }
  
  // 默认返回0.5
  return 0.5;
};

/**
 * 根据背景色亮度决定文字颜色
 * @param backgroundColor - 背景颜色
 * @returns 适合的文字颜色，'black' 或 'white'
 */
export const getContrastColor = (backgroundColor: string): string => {
  const luminance = getLuminance(backgroundColor);
  return luminance > 0.5 ? 'black' : 'white';
}; 