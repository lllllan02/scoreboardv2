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

// Walk 遍历所有类型的比赛并返回完整的比赛列表
func (c ContestList) Walk() (res []*Contest) {
	// 依次遍历各类比赛并合并结果
	res = append(res, c.Camp.Walk()...)
	res = append(res, c.ProvincialContest.Walk()...)
	res = append(res, c.CCPC.Walk()...)
	res = append(res, c.ICPC.Walk()...)
	return
}

// WalkOrg 遍历组织结构，收集所有组织下的比赛
func (c OrganizationGroup) Walk() (res []*Contest) {
	for _, yearGroup := range c {
		res = append(res, yearGroup.Walk()...)
	}
	return
}

// WalkYear 遍历年份，收集特定年份下的所有比赛
func (c YearGroup) Walk() (res []*Contest) {
	for _, contestGroup := range c {
		res = append(res, contestGroup.Walk()...)
	}
	return
}

// WalkGroup 遍历比赛组，收集所有单个比赛
func (c ContestGroup) Walk() (res []*Contest) {
	for _, contest := range c {
		res = append(res, contest)
	}
	return
}
