export interface StatResponse {
	code: number;
	data: Stat;
}

export interface HeatmapItem {
	timestamp: number;
	status: 'accepted' | 'rejected';
	count: number;
}

export interface ProblemHeatmap {
	problem_id: string;
	submissions: HeatmapItem[];
}

export interface ContestHeatmap {
	total: ProblemHeatmap;
	problems: ProblemHeatmap[];
}

export interface Stat {
	problem_count: number;
	team_count: number;
	run_count: number;
	accepted_count: number;
	rejected_count: number;
	accepted_rate: number;
	contest_heatmap: ContestHeatmap;
}

export interface RunHeatmap {
	accepted: RunHeatmapItem[];
	rejected: RunHeatmapItem[];
}

export interface RunHeatmapItem {
	timestamp: number;
	count: number;
}

