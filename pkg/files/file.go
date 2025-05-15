package files

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
)

func Load[T any](path string, target T) error {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return errors.New("文件不存在")
	}

	file, err := os.Open(path)
	if err != nil {
		return err
	}

	return json.NewDecoder(file).Decode(target)
}

// Save 保存数据到本地
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
