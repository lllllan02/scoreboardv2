package model

import "slices"

const (
	// 所有队伍
	GroupAll = "all"
	// 女队
	GroupGirl = "girl"
	// 正式队伍
	GroupOfficial = "official"
	// 非正式队伍
	GroupUnofficial = "unofficial"
	// 本科队伍
	GroupUndergraduate = "undergraduate"
	// 高职队伍
	GroupVocational = "vocational"
)

type TeamList map[string]Team

type Team struct {
	TeamId        FlexString `json:"team_id,omitempty"`
	Name          FlexString `json:"name,omitempty"`
	Organization  string     `json:"organization,omitempty"`
	Coach         string     `json:"coach,omitempty"`
	Location      string     `json:"location,omitempty"`
	Members       []string   `json:"members,omitempty"`
	Group         []string   `json:"group,omitempty"`
	Official      FlexBool   `json:"official,omitempty"`
	Unofficial    FlexBool   `json:"unofficial,omitempty"`
	Girl          FlexBool   `json:"girl,omitempty"`
	Undergraduate FlexBool   `json:"undergraduate,omitempty"`
	Vocational    FlexBool   `json:"vocational,omitempty"`
}

func (t *Team) IsUnofficial() bool {
	return slices.Contains(t.Group, GroupUnofficial) || bool(t.Unofficial)
}
