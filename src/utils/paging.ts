const default_page = 0
const default_perPage = 20
const default_limit = 20

export interface PagingParams {
	query?: any
	page?: number | string | string[] | undefined | any
	perPage?: number | string | string[] | undefined | any
	limit?: number | string | string[] | undefined | any
	offset?: number | string | string[] | undefined | any
	count?: number
	sort?: any
}

export interface PagingReturn {
	query?: any
	page?: number
	perPage?: number
	totalPages?: number
	limit?: number
	offset?: number
	count?: number
}

const stringInt2Int = (arg?: number | string) => (typeof arg === 'number' ? arg : typeof arg === 'string' ? parseInt(arg) : 0)

// Page & Limit, Offset Convert
export const makeParamQuery = ({ page, perPage, limit, offset }: PagingParams): PagingParams => {
	const i_page = stringInt2Int(page)
	const i_perPage = stringInt2Int(perPage)
	const i_limit = stringInt2Int(limit)
	const i_offset = stringInt2Int(offset)

	const query_limit = i_perPage ? i_perPage : i_limit ? i_limit : default_limit
	const query_offset = page ? ((i_page > 0 ? i_page + 1 : 1) - 1) * query_limit : i_offset

	return {
		page: i_page,
		perPage: i_perPage,
		limit: query_limit,
		offset: query_offset,
	}
}

export const makeParamReturn = ({ count, query, page, perPage, limit, offset }: PagingParams): PagingReturn => {
	const i_page = stringInt2Int(page)
	const i_perPage = stringInt2Int(perPage)
	const i_limit = stringInt2Int(limit)
	const i_offset = stringInt2Int(offset)
	const i_count = stringInt2Int(count)

	const params: PagingReturn = { limit: i_limit, offset: i_offset }

	params.query = { ...query, page: i_page, perPage: i_perPage }
	params.count = count
	params.page = i_page
	params.perPage = i_perPage || default_limit
	params.totalPages = Math.floor(i_count / i_limit) + (i_count % i_limit ? 1 : 0)

	return params
}

export default { makeParamQuery, makeParamReturn }
