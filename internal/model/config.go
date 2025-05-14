package model

// ContestConfig 定义竞赛配置的结构体
type ContestConfig struct {
	ContestName       string            `json:"contest_name,omitempty"`
	StartTime         int64             `json:"start_time,omitempty"`
	EndTime           int64             `json:"end_time,omitempty"`
	FrozenTime        int               `json:"frozen_time,omitempty"`
	Penalty           int               `json:"penalty,omitempty"`
	ProblemQuantity   int               `json:"problem_quantity,omitempty"`
	ProblemID         []string          `json:"problem_id,omitempty"`
	Group             map[string]string `json:"group,omitempty"`
	Organization      string            `json:"organization,omitempty"`
	StatusTimeDisplay StatusTimeDisplay `json:"status_time_display,omitempty"`
	Medal             Medal             `json:"medal,omitempty"`
	BalloonColor      []BalloonColor    `json:"balloon_color,omitempty"`
	Logo              Logo              `json:"logo,omitempty"`
	Link              Link              `json:"link,omitempty"`
	Options           Options           `json:"options,omitempty"`
}

// StatusTimeDisplay 定义状态时间显示的结构体
type StatusTimeDisplay struct {
	Correct   FlexBool `json:"correct,omitempty"`
	Incorrect FlexBool `json:"incorrect,omitempty"`
	Pending   FlexBool `json:"pending,omitempty"`
}

// Medal 定义奖牌信息的结构体
type Medal struct {
	Type     string        `json:"type,omitempty"`
	Official OfficialMedal `json:"official,omitempty"`
}

// OfficialMedal 定义正式奖牌的结构体
type OfficialMedal struct {
	Gold   int `json:"gold,omitempty"`
	Silver int `json:"silver,omitempty"`
	Bronze int `json:"bronze,omitempty"`
}

// BalloonColor 定义气球颜色的结构体
type BalloonColor struct {
	Color           string `json:"color,omitempty"`
	BackgroundColor string `json:"background_color,omitempty"`
}

// Logo 定义 logo 的结构体
type Logo struct {
	Preset string `json:"preset,omitempty"`
	Base64 string `json:"base64,omitempty"`
	Path   string `json:"path,omitempty"`
}

// Link 表示相关链接
type Link struct {
	Homepage     string `json:"homepage,omitempty"`
	Registration string `json:"registration,omitempty"`
}

// Options 定义选项的结构体
type Options struct {
	CalculationOfPenalty string `json:"calculation_of_penalty,omitempty"`
}
