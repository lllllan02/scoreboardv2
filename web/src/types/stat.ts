export interface StatResponse {
	code: number;
	data: Stat;
}

export interface Stat {
	problem_count: number;
	team_count: number;
	run_count: number;
	accepted_count: number;
	rejected_count: number;
	accepted_rate: number;
	run_heatmap: RunHeatmap;
	problem_run_heatmap: RunHeatmap[];
	problem_run_count: number[];
	problem_accepted_count: number[];
	problem_rejected_count: number[];
	accepted_team_count: number[];
}

export interface RunHeatmap {
	accepted: RunHeatmapItem[];
	rejected: RunHeatmapItem[];
}

export interface RunHeatmapItem {
	timestamp: number;
	count: number;
}

