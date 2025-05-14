package remote

import (
	"encoding/json"
	"io"
	"net/http"
)

// Fetch 从 URL 获取数据并解析为指定类型
func Fetch[T any](url string, target T) error {
	body, err := Get(url)
	if err != nil {
		return err
	}

	return json.Unmarshal(body, target)
}

// Get 从 URL 获取数据
func Get(url string) ([]byte, error) {
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	return body, nil
}
