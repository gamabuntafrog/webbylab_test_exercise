import { z } from "zod";
import { MovieFormat } from "@db/models/Movie";

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
