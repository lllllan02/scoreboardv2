package slices

// Unique 去重
func Unique[T comparable](slice []T) []T {
	seen := make(map[T]bool)
	result := []T{}
	for _, v := range slice {
		if !seen[v] {
			seen[v] = true
			result = append(result, v)
		}
	}
	return result
}

// RemoveEmpty 去除空值
func RemoveEmpty(slice []string) []string {
	result := []string{}
	for _, v := range slice {
		if v != "" {
			result = append(result, v)
		}
	}
	return result
}
