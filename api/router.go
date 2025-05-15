package api

import (
	"github.com/gin-gonic/gin"
	"github.com/lllllan02/scoreboardv2/api/handler"
	"github.com/lllllan02/scoreboardv2/config"
	"github.com/lllllan02/scoreboardv2/internal/middleware"
)

// SetupRouter 配置路由
func SetupRouter() *gin.Engine {
	// 设置 Gin 模式
	gin.SetMode(config.GetConfig().Server.Mode)

	// 使用 gin.New() 代替 gin.Default()，避免默认添加中间件
	r := gin.New()

	// 手动添加 Recovery 中间件，避免程序因 panic 而崩溃
	r.Use(gin.Recovery())

	// 添加自定义日志中间件
	r.Use(middleware.Logger())

	// 设置受信任的代理
	// 对于开发环境，可以使用 127.0.0.1/8
	// 生产环境应该指定您的负载均衡器/代理的 IP 或 CIDR 范围
	r.SetTrustedProxies([]string{"127.0.0.1"})

	// 健康检查
	r.GET("/ping", func(c *gin.Context) { c.JSON(200, gin.H{"message": "pong"}) })

	// API 路由
	// 获取比赛列表
	r.GET("/api/contests", handler.GetContestList)
	// 获取比赛配置
	r.GET("/api/config/*path", handler.GetContestConfig)
	// 获取比赛排名
	r.GET("/api/rank/*path", handler.GetContestRank)
	return r
}
