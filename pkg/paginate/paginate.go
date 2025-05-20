package paginate

func Paginate(page int, pageSize int, total int) (int, int) {
	if page < 1 {
		page = 1
	}

	if pageSize < 1 {
		pageSize = 10
	}

	start := (page - 1) * pageSize
	end := start + pageSize

	if start > total {
		return 0, 0
	}

	if end > total {
		end = total
	}

	return start, end
}
