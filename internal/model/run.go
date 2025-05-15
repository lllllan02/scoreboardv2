package model

type RunList []Run

type Run struct {
	Status       string     `json:"status"`
	TeamId       FlexString `json:"team_id"`
	ProblemId    int        `json:"problem_id"`
	Timestamp    int        `json:"timestamp"`
	Language     string     `json:"language"`
	SubmissionId string     `json:"submission_id"`
}
