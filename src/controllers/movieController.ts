import { Request, Response, NextFunction } from "express";
import MovieService from "@services/movieService";
import mapper from "@mappers/mapper";
import {
  createMovieSchema,
  deleteMovieByIdSchema,
  updateMovieSchema,
  getMovieByIdSchema,
  listMoviesSchema,
} from "@validators/movieValidator";
import requestHelper from "@helpers/requestHelper";
import { parseMoviesFile } from "@helpers/movieImportParser";
import { z } from "zod";

class MovieController {
  constructor(private readonly movieService: MovieService) {}

  /**
   * Create a new movie
   */
  public async createMovie(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const movieData = mapper.toDTO(req, createMovieSchema);
      const result = await this.movieService.createMovie(movieData);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a movie by ID
   */
  public async getMovieById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = mapper.toDTO(req, getMovieByIdSchema);
      const result = await this.movieService.getMovieByIdWithActors(id);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a movie by ID
   */
  public async updateMovie(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = mapper.toDTO(req, getMovieByIdSchema);

      const updateData = mapper.toDTO(req, updateMovieSchema);

      const result = await this.movieService.updateMovie(id, updateData);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a movie by ID
   */
  public async deleteMovie(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = mapper.toDTO(req, deleteMovieByIdSchema);
      await this.movieService.deleteMovie(id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * List movies with sorting, limit, offset, and filtering
   */
  public async listMovies(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedData = mapper.toDTO(req, listMoviesSchema) as z.infer<
        typeof listMoviesSchema
      >;
      const { sort, order, limit, offset, actor, title, search } =
        validatedData;

      const filters = {
        actor,
        title,
        search,
      };

      const { movies, total } = await this.movieService.listMovies(
        sort,
        order,
        limit,
        offset,
        filters
      );

      const result = requestHelper.formatPaginatedResponse(
        movies,
        limit,
        offset,
        total
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Import movies from a file
   */
  public async importMovies(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const file = req.file!; // validated by multer;

      const parseResult = parseMoviesFile(file.buffer.toString("utf-8"));

      // Import movies
      const importResult = await this.movieService.importMovies(
        parseResult.movies
      );

      // Combine parsing errors with import errors
      const allErrors = [...parseResult.errors, ...importResult.errors];

      // Calculate totals
      const total = parseResult.movies.length + parseResult.errors.length;
      const imported = importResult.created.length;
      const errorsCount = allErrors.length;

      // Status: 1 if at least some movies were imported, 0 if all failed
      const status = imported > 0 ? 1 : 0;

      // Return result
      res.status(200).json({
        data: importResult.created,
        meta: {
          imported,
          total,
          errors: errorsCount > 0 ? allErrors : undefined,
        },
        status,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default MovieController;
