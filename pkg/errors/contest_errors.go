package errors

import "net/http"

// 预定义的比赛相关错误
var (
	// 404 - 资源不存在
	ErrContestListNotFound = &ServiceError{
		StatusCode: http.StatusNotFound,
		Message:    "比赛列表数据不存在",
	}

	ErrContestConfigNotFound = &ServiceError{
		StatusCode: http.StatusNotFound,
		Message:    "比赛配置数据不存在",
	}

	ErrContestTeamNotFound = &ServiceError{
		StatusCode: http.StatusNotFound,
		Message:    "比赛队伍数据不存在",
	}

	ErrContestRunNotFound = &ServiceError{
		StatusCode: http.StatusNotFound,
		Message:    "比赛运行数据不存在",
	}

	// 400 - 请求参数错误
	ErrEmptyContestPath = &ServiceError{
		StatusCode: http.StatusBadRequest,
		Message:    "比赛路径不能为空",
	}
)
