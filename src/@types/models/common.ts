interface ModelFindListOption {
	limit?: number
	offset?: number
	sort?: {
		[key: 'createdAt' | 'updatedAt' | string]: number
	}
}
