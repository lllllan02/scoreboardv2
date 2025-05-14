package errors

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

// APIResponse 定义统一的API响应格式
type APIResponse struct {
	Code    int         `json:"code"`              // 状态码
	Message string      `json:"message,omitempty"` // 消息
	Data    interface{} `json:"data,omitempty"`    // 数据
	Error   string      `json:"error,omitempty"`   // 错误信息
}

// SendSuccess 发送成功响应
func SendSuccess(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, APIResponse{
		Code: http.StatusOK,
		Data: data,
	})
}

// SendError 发送错误响应
func SendError(c *gin.Context, err error) {
	var svcErr *ServiceError
	if errors.As(err, &svcErr) {
		c.JSON(svcErr.GetStatusCode(), APIResponse{
			Code:  svcErr.GetStatusCode(),
			Error: svcErr.GetMessage(),
		})
		return
	}

	// 未知错误
	c.JSON(http.StatusInternalServerError, APIResponse{
		Code:  http.StatusInternalServerError,
		Error: "服务器内部错误",
	})
}
