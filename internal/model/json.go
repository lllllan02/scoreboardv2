package model

import (
	"encoding/json"
	"fmt"

	"github.com/spf13/cast"
)

// FlexBool 是一个可以从多种 JSON 格式中解析为布尔值的类型
type FlexBool bool

// UnmarshalJSON 实现自定义JSON解析逻辑
func (fb *FlexBool) UnmarshalJSON(data []byte) error {
	if len(data) == 0 {
		return nil
	}

	var err error
	boolValue, err := cast.ToBoolE(string(data))
	if err != nil {
		return err
	}
	*fb = FlexBool(boolValue)
	return nil
}

type FlexString string

func (m *FlexString) UnmarshalJSON(data []byte) error {
	if len(data) == 0 {
		return nil
	}

	var strValue string
	if err := json.Unmarshal(data, &strValue); err == nil {
		*m = FlexString(strValue)
	}

	if intValue, err := cast.ToIntE(string(data)); err == nil {
		*m = FlexString(fmt.Sprint(intValue))
	}

	return nil
}

func (m *Medal) UnmarshalJSON(data []byte) error {
	if len(data) == 0 {
		return nil
	}

	// 检查是否是字符串
	if data[0] == '"' && data[len(data)-1] == '"' {
		medalType := string(data[1 : len(data)-1])
		m.Type = medalType
		return nil
	}

	// 正常情况：解析为一个对象
	// 定义一个临时结构体来接收正常的 JSON 数据
	type MedalTemp Medal
	var temp MedalTemp
	if err := json.Unmarshal(data, &temp); err != nil {
		return err
	}

	// 将解析结果复制回原结构体
	*m = Medal(temp)
	return nil
}
