package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/lllllan02/scoreboardv2/internal/service"
	"github.com/lllllan02/scoreboardv2/pkg/errors"
	"github.com/spf13/cast"
)

// GetContestList 返回比赛列表数据
func GetContestList(c *gin.Context) {
	// 比赛名称
	contestName := c.Query("contest_name")

	// 调用服务层获取数据
	contestList, err := service.GetContestList(contestName)
	if err != nil {
		errors.SendError(c, err)
		return
	}

	// 返回数据
	errors.SendSuccess(c, contestList)
}

// GetContestConfig 返回比赛配置数据
func GetContestConfig(c *gin.Context) {
	// 获取请求路径
	path := c.Param("path")

	// 调用服务层获取数据
	config, err := service.GetContestConfig(path)
	if err != nil {
		errors.SendError(c, err)
		return
	}

	// 返回数据
	errors.SendSuccess(c, config)
}

// GetContestRank 返回比赛排名数据
func GetContestRank(c *gin.Context) {
	// 获取请求路径
	path := c.Param("path")
	t := cast.ToInt(c.Query("t"))

	// 调用服务层获取数据
	rank, err := service.GetContestRank(path, t)
	if err != nil {
		errors.SendError(c, err)
		return
	}

	// 返回数据
	errors.SendSuccess(c, rank)
}
