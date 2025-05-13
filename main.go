package main

import (
	"fmt"
	"log"

	"github.com/lllllan02/scoreboardv2/api"
	"github.com/lllllan02/scoreboardv2/config"
)

func main() {
	cfg := config.GetConfig()

	// 获取路由
	r := api.SetupRouter()

	// 启动服务器
	serverAddr := fmt.Sprintf(":%d", cfg.Server.Port)
	if err := r.Run(serverAddr); err != nil {
		log.Fatalf("启动服务器失败: %v", err)
	}
}
