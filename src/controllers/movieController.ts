import { Request, Response, NextFunction } from "express";
import MovieService from "@services/movieService";
import mapper from "@mappers/mapper";
import { createMovieSchema } from "@validators/movieValidator";

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
}

export default MovieController;
