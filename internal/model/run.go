package model

type RunList []Run

type Run struct {
	Status       string     `json:"status,omitempty"`
	TeamId       FlexString `json:"team_id,omitempty"`
	ProblemId    int        `json:"problem_id,omitempty"`
	Timestamp    int        `json:"timestamp,omitempty"`
	Language     string     `json:"language,omitempty"`
	SubmissionId string     `json:"submission_id,omitempty"`
}
