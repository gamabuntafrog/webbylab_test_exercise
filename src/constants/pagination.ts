export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  DEFAULT_OFFSET: 0,
  SORT_ORDERS: ["ASC", "DESC"] as const,
} as const;

export type Pagination = typeof PAGINATION;
