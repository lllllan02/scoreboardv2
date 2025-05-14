package model

type TeamList map[string]Team

type Team struct {
	TeamId       FlexString `json:"team_id,omitempty"`
	Name         FlexString `json:"name,omitempty"`
	Organization string     `json:"organization,omitempty"`
	Coach        string     `json:"coach,omitempty"`
	Location     string     `json:"location,omitempty"`
	Members      []string   `json:"members,omitempty"`
	Official     FlexBool   `json:"official,omitempty"`
	Unofficial   FlexBool   `json:"unofficial,omitempty"`
	Girl         FlexBool   `json:"girl,omitempty"`
}
