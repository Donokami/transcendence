import { applyDecorators } from '@nestjs/common'
import { ApiQuery } from '@nestjs/swagger'

export function PaginateQueryOptions() {
  return applyDecorators(
    ApiQuery({
      name: 'page',
      required: false,
      description: 'Page number (starting from 1)',
      example: 1
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      description: 'Number of records per page',
      example: 10
    }),
    ApiQuery({
      name: 'search',
      required: false,
      description: 'Multicolumn search term'
    }),
    ApiQuery({
      name: 'searchBy',
      required: false,
      description: "Limit columns to which apply 'search' term",
      isArray: true,
      type: 'string'
    }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      description:
        'Format: _field_:_direction_ [direction may be ASC or DESC] e.g. id:DESC'
    })
  )
}
