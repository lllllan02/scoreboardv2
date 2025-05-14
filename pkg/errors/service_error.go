package errors

import (
	"fmt"
	"net/http"
)

// ServiceError 自定义错误类型，包含状态码
type ServiceError struct {
	StatusCode int    // HTTP状态码
	Message    string // 错误信息
	Err        error  // 原始错误
}

// Error 实现error接口
func (e *ServiceError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %v", e.Message, e.Err)
	}
	return e.Message
}

// Unwrap 返回原始错误
func (e *ServiceError) Unwrap() error {
	return e.Err
}

// GetStatusCode 获取HTTP状态码
func (e *ServiceError) GetStatusCode() int {
	return e.StatusCode
}

// GetMessage 获取错误消息
func (e *ServiceError) GetMessage() string {
	return e.Message
}

// New 创建一个新的服务错误
func New(statusCode int, message string, err error) *ServiceError {
	return &ServiceError{
		StatusCode: statusCode,
		Message:    message,
		Err:        err,
	}
}

// NewNotFound 创建一个404错误
func NewNotFound(message string) *ServiceError {
	return &ServiceError{
		StatusCode: http.StatusNotFound,
		Message:    message,
	}
}

// NewBadRequest 创建一个400错误
func NewBadRequest(message string) *ServiceError {
	return &ServiceError{
		StatusCode: http.StatusBadRequest,
		Message:    message,
	}
}

// NewInternalError 创建一个500错误
func NewInternalError(message string, err error) *ServiceError {
	return &ServiceError{
		StatusCode: http.StatusInternalServerError,
		Message:    message,
		Err:        err,
	}
}
