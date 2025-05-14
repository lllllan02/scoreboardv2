package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/lllllan02/scoreboardv2/internal/service"
	"github.com/lllllan02/scoreboardv2/pkg/errors"
)

// 比赛服务实例
var contestService = service.NewContestService()

// GetContestList 返回比赛列表数据
func GetContestList(c *gin.Context) {
	// 比赛名称
	contestName := c.Query("contest_name")

	// 调用服务层获取数据
	contestList, err := contestService.GetContestList(contestName)
	if err != nil {
		errors.SendError(c, err)
		return
	}

	// 返回数据
	errors.SendSuccess(c, contestList)
}
