import { PaginateQuery, Paginated } from 'nestjs-paginate'

export const paginate = async <T>(
  query: PaginateQuery,
  data: T[]
): Promise<Paginated<T>> => {
  const { page = 1, limit = 20 } = query
  const total = data.length
  const lastPage = Math.ceil(total / limit)
  let items = data.slice(limit * (page - 1), limit * page)

  if (query.search) {
    const search = query.search.toLowerCase()
    const searchBy = query.searchBy || 'name'

    items = items.filter((item) => {
      return item[searchBy[0]].toLowerCase().includes(search)
    })
  }

  const paginated: Paginated<T> = {
    data: items,
    meta: {
      itemsPerPage: limit,
      totalItems: total,
      currentPage: page,
      totalPages: lastPage,
      sortBy: undefined,
      searchBy: undefined,
      search: undefined,
      select: undefined
    },
    links: {
      current: `${query.path}?limit=${limit}&page=${page}`
    }
  }

  if (page < lastPage) {
    paginated.links.next = `${query.path}?limit=${limit}&page=${page + 1}`
  }

  if (page > 1) {
    paginated.links.previous = `${query.path}?limit=${limit}&page=${page - 1}`
  }

  if (page === 1 && page < lastPage) {
    paginated.links.last = `${query.path}?limit=${limit}&page=${lastPage}`
  }

  if (page > 1 && page < lastPage) {
    paginated.links.first = `${query.path}?limit=${limit}&page=1`
  }

  return paginated
}
