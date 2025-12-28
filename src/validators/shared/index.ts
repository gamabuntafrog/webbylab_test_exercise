import { PAGINATION } from "@constants/pagination";
import { AnyZodObject, z } from "zod";

/**
 * Pagination schema with limit and offset
 */
export const paginationSchema = z.object({
  limit: z.coerce
    .number({
      invalid_type_error: "limit must be a number",
    })
    .int("limit must be an integer")
    .positive("limit must be positive")
    .default(PAGINATION.DEFAULT_LIMIT),
  offset: z.coerce
    .number({
      invalid_type_error: "offset must be a number",
    })
    .int("offset must be an integer")
    .min(0, "offset must be non-negative")
    .default(PAGINATION.DEFAULT_OFFSET),
});

/**
 * Combined pagination and sorting schema
 */
export const paginationAndSortingSchema = <T extends AnyZodObject>(schema: T) =>
  paginationSchema.merge(schema);
