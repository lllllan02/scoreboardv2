package helper

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"path/filepath"
)

func Fetch[T any](url string, target T) error {
	body, err := Get(url)
	if err != nil {
		return err
	}

	return json.Unmarshal(body, target)
}

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

func Save(path string, data any) error {
	// 格式化JSON为美观缩进格式
	prettyJSON, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return err
	}

	// 创建目录
	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		return err
	}

	// 保存到本地
	if err := os.WriteFile(path, prettyJSON, 0644); err != nil {
		return err
	}

	return nil
}
