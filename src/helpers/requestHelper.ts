import { PAGINATION } from "@constants/pagination";

export interface PaginationParams {
  limit: number;
  offset: number;
}

export interface PaginationMeta {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  status: number;
}

/**
 * RequestHelper class for handling pagination logic and formatting
 */
class RequestHelper {
  /**
   * Default limit for pagination
   */
  private readonly DEFAULT_LIMIT = PAGINATION.DEFAULT_LIMIT;

  /**
   * Default offset for pagination
   */
  private readonly DEFAULT_OFFSET = PAGINATION.DEFAULT_OFFSET;

  /**
   * Extract pagination parameters from validated data
   */
  public extractPagination<T extends PaginationParams>(
    data: T
  ): PaginationParams {
    return {
      limit: data.limit ?? this.DEFAULT_LIMIT,
      offset: data.offset ?? this.DEFAULT_OFFSET,
    };
  }

  /**
   * Calculate pagination metadata
   */
  public calculatePaginationMeta(
    limit: number,
    offset: number,
    total: number
  ): PaginationMeta {
    return {
      limit,
      offset,
      total,
      hasMore: offset + limit < total,
    };
  }

  /**
   * Format paginated response
   */
  public formatPaginatedResponse<T>(
    data: T[],
    limit: number,
    offset: number,
    total: number,
    status: number = 1
  ): PaginatedResponse<T> {
    return {
      data,
      meta: this.calculatePaginationMeta(limit, offset, total),
      status,
    };
  }
}

// Export singleton instance
export default new RequestHelper();
