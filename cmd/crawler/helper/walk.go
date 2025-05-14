package helper

import (
	"github.com/lllllan02/scoreboardv2/internal/model"
)


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
