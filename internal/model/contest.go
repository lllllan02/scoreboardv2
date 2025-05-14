package model

// ContestList 定义顶层的比赛列表结构
type ContestList struct {
	Camp              OrganizationGroup `json:"camp"`
	ProvincialContest YearGroup         `json:"provincial-contest"`
	CCPC              YearGroup         `json:"ccpc"`
	ICPC              YearGroup         `json:"icpc"`
}

// OrganizationGroup 表示一个组织下的年份或一个年份下的比赛组别
type OrganizationGroup map[string]YearGroup

// YearGroup 表示一个年份下的比赛组别
type YearGroup map[string]ContestGroup

// ContestGroup 表示一组比赛，如一届赛事下的多个比赛
type ContestGroup map[string]*Contest

// Contest 表示单个比赛
type Contest struct {
	BoardLink string        `json:"board_link"`
	Config    ContestConfig `json:"config"`
}
