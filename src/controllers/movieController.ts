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
   * List movies with sorting
   */
  public async listMovies(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { sort, order } = mapper.toDTO(req, listMoviesSchema);

      console.log(sort, order);
      const result = await this.movieService.listMovies(sort, order);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default MovieController;
