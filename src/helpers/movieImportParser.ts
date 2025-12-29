import { z } from "zod";
import { MovieFormat } from "@db/models/Movie";

export interface ParsedMovie {
  title: string;
  year: number;
  format: MovieFormat;
  actors: string[];
}

export interface ParseResult {
  movies: ParsedMovie[];
  errors: string[];
}

/**
 * Normalize format string to MovieFormat enum value (case-insensitive)
 * Handles variations like "Blu-Ray", "BLU-RAY", "blu-ray", etc.
 */
function normalizeFormat(formatStr: string): MovieFormat {
  // Normalize to lowercase and remove spaces/hyphens variations
  const normalized = formatStr.toLowerCase().replace(/[\s-]/g, "");

  // Map normalized strings to MovieFormat enum values
  if (normalized === "vhs") {
    return MovieFormat.VHS;
  }
  if (normalized === "dvd") {
    return MovieFormat.DVD;
  }
  if (normalized === "bluray") {
    return MovieFormat.BLU_RAY;
  }

  // If no match, throw error with valid formats
  throw new Error(
    `Invalid format: ${formatStr}. Must be one of: ${Object.values(MovieFormat).join(", ")}`
  );
}

/**
 * Zod schema for parsing and normalizing a movie from text format
 */
const movieBlockSchema = z.object({
  title: z
    .string({
      required_error: "Title is required",
      invalid_type_error: "Title must be a string",
    })
    .trim()
    .min(1, "Title cannot be empty")
    .max(255, "Title must be at most 255 characters"),
  year: z.coerce
    .number({
      required_error: "Release Year is required",
      invalid_type_error: "Release Year must be a number",
    })
    .int("Release Year must be an integer")
    .min(1888, "Year must be at least 1888")
    .max(new Date().getFullYear() + 10, "Year cannot be too far in the future"),
  format: z
    .string({
      required_error: "Format is required",
      invalid_type_error: "Format must be a string",
    })
    .transform((val) => normalizeFormat(val))
    .pipe(
      z.nativeEnum(MovieFormat, {
        errorMap: () => ({
          message: `Format must be one of: ${Object.values(MovieFormat).join(", ")}`,
        }),
      })
    ),
  actors: z
    .array(
      z
        .string({
          required_error: "Actor name is required",
          invalid_type_error: "Actor name must be a string",
        })
        .trim()
        .min(1, "Actor name cannot be empty")
        .max(255, "Actor name must be at most 255 characters")
    )
    .min(1, "At least one actor is required"),
});

/**
 * Parse movies from text file format
 * Format:
 * Title: <title>
 * Release Year: <year>
 * Format: <format>
 * Stars: <actor1>, <actor2>, ...
 * <blank line>
 */
export function parseMoviesFile(fileContent: string): ParseResult {
  const movies: ParsedMovie[] = [];
  const errors: string[] = [];

  // Split by double newlines to separate movies
  const movieBlocks = fileContent
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);

  movieBlocks.forEach((block, index) => {
    try {
      const movie = parseMovieBlock(block, index + 1);
      if (movie) {
        movies.push(movie);
      }
    } catch (error) {
      errors.push(
        `Movie block ${index + 1}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });

  return { movies, errors };
}

/**
 * Parse a single movie block using Zod schema
 */
function parseMovieBlock(
  block: string,
  _blockNumber: number
): ParsedMovie | null {
  const lines = block.split("\n").map((line) => line.trim());
  const rawData: {
    title?: string;
    year?: string;
    format?: string;
    actors?: string;
  } = {};

  // Extract data from lines
  for (const line of lines) {
    if (line.startsWith("Title:")) {
      rawData.title = line.replace(/^Title:\s*/i, "").trim();
    } else if (line.startsWith("Release Year:")) {
      rawData.year = line.replace(/^Release Year:\s*/i, "").trim();
    } else if (line.startsWith("Format:")) {
      rawData.format = line.replace(/^Format:\s*/i, "").trim();
    } else if (line.startsWith("Stars:")) {
      rawData.actors = line.replace(/^Stars:\s*/i, "").trim();
    }
  }

  // Parse actors string into array
  const actorsArray = rawData.actors
    ? rawData.actors
        .split(",")
        .map((actor) => actor.trim())
        .filter((actor) => actor.length > 0)
    : [];

  // Use Zod schema to parse and validate
  const result = movieBlockSchema.safeParse({
    title: rawData.title,
    year: rawData.year,
    format: rawData.format,
    actors: actorsArray,
  });

  if (!result.success) {
    // Format Zod errors into a readable message
    const errorMessages = result.error.errors.map((err) => {
      const path = err.path.join(".");
      return path ? `${path}: ${err.message}` : err.message;
    });

    throw new Error(errorMessages.join("; "));
  }

  return result.data;
}
