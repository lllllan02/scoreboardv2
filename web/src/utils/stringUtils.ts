/**
 * 将下划线分隔的字符串转换为首字母大写的空格分隔形式
 * @param status 原始状态字符串，例如："WRONG_ANSWER"
 * @returns 格式化后的字符串，例如："Wrong Answer"
 */
export const formatStatus = (status: string): string => {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}; 