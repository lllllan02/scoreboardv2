package helper

import (
	"github.com/lllllan02/scoreboardv2/internal/model"
)

// Walk 遍历所有类型的比赛并返回完整的比赛列表
func Walk(contestList model.ContestList) (res []*model.Contest) {
	// 依次遍历各类比赛并合并结果
	res = append(res, WalkOrg(contestList.Camp)...)
	res = append(res, WalkYear(contestList.ProvincialContest)...)
	res = append(res, WalkYear(contestList.CCPC)...)
	res = append(res, WalkYear(contestList.ICPC)...)
	return
}

// WalkOrg 遍历组织结构，收集所有组织下的比赛
func WalkOrg(org model.OrganizationGroup) (res []*model.Contest) {
	for _, yearGroup := range org {
		res = append(res, WalkYear(yearGroup)...)
	}
	return
}

// WalkYear 遍历年份，收集特定年份下的所有比赛
func WalkYear(year model.YearGroup) (res []*model.Contest) {
	for _, contestGroup := range year {
		res = append(res, WalkGroup(contestGroup)...)
	}
	return
}

// WalkGroup 遍历比赛组，收集所有单个比赛
func WalkGroup(group model.ContestGroup) (res []*model.Contest) {
	for _, contest := range group {
		res = append(res, contest)
	}
	return
}

// Clean 清理空的比赛
func Clean(contestList model.ContestList) {
	for _, yearGroup := range contestList.Camp {
		for _, contestGroup := range yearGroup {
			for key, contest := range contestGroup {
				if contest.BoardLink == "" {
					delete(contestGroup, key)
				}
			}
		}
	}

	for _, contestGroup := range contestList.ProvincialContest {
		for key, contest := range contestGroup {
			if contest.BoardLink == "" {
				delete(contestGroup, key)
			}
		}
	}

	for _, contestGroup := range contestList.CCPC {
		for key, contest := range contestGroup {
			if contest.BoardLink == "" {
				delete(contestGroup, key)
			}
		}
	}

	for _, contestGroup := range contestList.ICPC {
		for key, contest := range contestGroup {
			if contest.BoardLink == "" {
				delete(contestGroup, key)
			}
		}
	}
}
