package config

import (
	_ "embed"
	"fmt"
	"sync"

	"github.com/spf13/viper"
	"gopkg.in/yaml.v3"
)

// Config 应用配置
type Config struct {
	Server ServerConfig `mapstructure:"server" yaml:"server"`
	Data   DataConfig   `mapstructure:"data" yaml:"data"`
}

// ServerConfig 服务器配置
type ServerConfig struct {
	Port int    `mapstructure:"port" yaml:"port"`
	Mode string `mapstructure:"mode" yaml:"mode"`
}

// DataConfig JSON 数据存储配置
type DataConfig struct {
	Path string `mapstructure:"path" yaml:"path"` // JSON 文件存储路径
}

// 全局配置实例和同步控制
var (
	//go:embed config.example.yaml
	configTemplate []byte

	globalConfig *Config
	once         sync.Once // 确保配置只初始化一次
)

// InitConfig 初始化配置
func InitConfig() {
	globalConfig = &Config{}
	yaml.Unmarshal(configTemplate, globalConfig)

	loadConfig()
}

func loadConfig() {
	// 设置 Viper
	v := viper.New()
	v.SetConfigName("config") // 配置文件名称(不带扩展名)
	v.SetConfigType("yaml")   // 配置文件类型
	v.AddConfigPath(".")      // 当前目录
	v.AddConfigPath("config") // 在 config 子目录中查找

	// 尝试读取并解析配置文件
	if err := v.ReadInConfig(); err != nil {
		fmt.Printf("配置读取失败: %v，将使用默认配置", err)
		return
	}

	// 解析配置到结构体
	if err := v.Unmarshal(globalConfig); err != nil {
		fmt.Printf("配置解析失败: %v，将使用默认配置", err)
		return
	}

	// 输出配置文件路径
	fmt.Printf("使用配置文件: %s\n", v.ConfigFileUsed())
}

// GetConfig 获取配置
func GetConfig() *Config {
	once.Do(InitConfig)

	return globalConfig
}
