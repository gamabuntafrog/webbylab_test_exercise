import { z } from "zod";
import { MovieFormat } from "@db/models/Movie";
import { paginationAndSortingSchema } from "@validators/shared";

// Schema for creating a movie
export const createMovieSchema = z.object({
  title: z
    .string({
      required_error: "Title is required",
      invalid_type_error: "Title must be a string",
    })
    .min(1, "Title cannot be empty")
    .max(255, "Title must be at most 255 characters"),
  year: z
    .number({
      required_error: "Year is required",
      invalid_type_error: "Year must be a number",
    })
    .int("Year must be an integer")
    .min(1888, "Year must be at least 1888")
    .max(new Date().getFullYear() + 10, "Year cannot be too far in the future"),
  format: z.nativeEnum(MovieFormat, {
    required_error: "Format is required",
    invalid_type_error: `Format must be one of: ${Object.values(MovieFormat).join(", ")}`,
  }),
  actors: z
    .array(
      z
        .string({
          required_error: "Actor name is required",
          invalid_type_error: "Actor name must be a string",
        })
        .min(1, "Actor name cannot be empty")
        .max(255, "Actor name must be at most 255 characters")
    )
    .min(1, "At least one actor is required"),
});

// Base schema for movie ID validation
const movieIdSchema = z.coerce
  .number({
    required_error: "Movie ID is required",
    invalid_type_error: "Movie ID must be a number",
  })
  .int("Movie ID must be an integer")
  .positive("Movie ID must be positive");

// Schema for getting a movie by ID
export const getMovieByIdSchema = z.object({
  id: movieIdSchema,
});

// Schema for deleting a movie by ID
export const deleteMovieByIdSchema = z.object({
  id: movieIdSchema,
});

// Schema for updating a movie by ID (PATCH)
export const updateMovieSchema = z
  .object({
    title: z
      .string({
        invalid_type_error: "Title must be a string",
      })
      .min(1, "Title cannot be empty")
      .max(255, "Title must be at most 255 characters")
      .optional(),
    year: z
      .number({
        invalid_type_error: "Year must be a number",
      })
      .int("Year must be an integer")
      .min(1888, "Year must be at least 1888")
      .max(
        new Date().getFullYear() + 10,
        "Year cannot be too far in the future"
      )
      .optional(),
    format: z
      .nativeEnum(MovieFormat, {
        invalid_type_error: `Format must be one of: ${Object.values(MovieFormat).join(", ")}`,
      })
      .optional(),
    actors: z
      .array(
        z
          .string({
            invalid_type_error: "Actor name must be a string",
          })
          .min(1, "Actor name cannot be empty")
          .max(255, "Actor name must be at most 255 characters")
      )
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message:
      "At least one field (title, year, format, or actors) must be provided",
  });

/**
 * Sorting schema with sort field and order
 */
export const movieSortingSchema = z.object({
  sort: z
    .enum(["id", "title", "year"], {
      invalid_type_error: "sort must be one of: id, title, year",
    })
    .default("id"),
  order: z
    .enum(["ASC", "DESC"], {
      invalid_type_error: "order must be either ASC or DESC",
    })
    .default("ASC"),
});

/**
 * Filter schema for movies
 */
export const movieFilterSchema = z.object({
  actor: z
    .string({
      invalid_type_error: "actor must be a string",
    })
    .min(1, "actor filter cannot be empty")
    .optional(),
  title: z
    .string({
      invalid_type_error: "title must be a string",
    })
    .min(1, "title filter cannot be empty")
    .optional(),
  search: z
    .string({
      invalid_type_error: "search must be a string",
    })
    .min(1, "search filter cannot be empty")
    .optional(),
});

// Schema for listing movies with sorting and filtering
export const listMoviesSchema = paginationAndSortingSchema(
  movieSortingSchema.merge(movieFilterSchema)
);
