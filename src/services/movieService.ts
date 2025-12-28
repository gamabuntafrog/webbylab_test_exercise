import MovieRepository from "@repositories/MovieRepository";
import ActorRepository from "@repositories/ActorRepository";
import MovieActorRepository from "@repositories/MovieActorRepository";
import {
  Movie,
  MovieFormat,
  CreateMovieInput,
  UpdateMovieInput,
} from "@db/models/Movie";
import { withTransaction } from "@db/utilities/transaction";
import { NotFoundError } from "@errors/AppError";
import { ERROR_CODES } from "@constants/errorCodes";
import requestHelper, { PaginatedResponse } from "@helpers/requestHelper";

export interface CreateMovieData {
  title: string;
  year: number;
  format: MovieFormat;
  actors: string[];
}

export interface UpdateMovieData {
  title?: string;
  year?: number;
  format?: MovieFormat;
  actors?: string[];
}

export interface MovieResponse {
  id: number;
  title: string;
  year: number;
  format: MovieFormat;
  actors: Array<{ id: number; name: string }>;
  createdAt: Date;
  updatedAt: Date;
}

class MovieService {
  constructor(
    private readonly movieRepository: MovieRepository,
    private readonly actorRepository: ActorRepository,
    private readonly movieActorRepository: MovieActorRepository
  ) {}

  /**
   * Convert Movie model to response format
   */
  private toResponse(movie: Movie): MovieResponse {
    return {
      id: movie.id,
      title: movie.title,
      year: movie.year,
      format: movie.format,
      actors: (movie.actors || []).map((actor) => ({
        id: actor.id,
        name: actor.name,
      })),
      createdAt: movie.createdAt,
      updatedAt: movie.updatedAt,
    };
  }

  /**
   * Private method to get movie with actors (internal use)
   * Uses JOIN operation for better performance
   */
  private async _getMovieByIdWithActors(id: number): Promise<MovieResponse> {
    // Get movie with actors using JOIN
    const movie = await this.movieRepository.findByIdWithActors(id);
    if (!movie) {
      throw new NotFoundError(
        `Movie with id ${id} not found`,
        ERROR_CODES.MOVIE_NOT_FOUND
      );
    }

    return this.toResponse(movie);
  }

  /**
   * Get a movie by ID with actors (public API)
   */
  public async getMovieByIdWithActors(id: number): Promise<MovieResponse> {
    return await this._getMovieByIdWithActors(id);
  }

  /**
   * Create a new movie with actors
   */
  public async createMovie(data: CreateMovieData): Promise<MovieResponse> {
    const movieData: CreateMovieInput = {
      title: data.title.trim(),
      year: data.year,
      format: data.format,
    };

    const actorNames = data.actors.map((name) => name.trim()).filter(Boolean);

    // Execute all operations within a transaction
    const movie = await withTransaction(async (transaction) => {
      // Create the movie
      const createdMovie = await this.movieRepository.create(movieData, {
        transaction,
      });

      // Find or create actors using ActorRepository
      const actors = await this.actorRepository.findOrCreateByNames(
        actorNames,
        transaction
      );

      // Extract actor IDs
      const actorIds = actors.map((actor) => actor.id);

      // Add actors to movie through junction table repository
      await this.movieActorRepository.addActorsToMovie(
        createdMovie.id,
        actorIds,
        transaction
      );

      return {
        ...createdMovie.toJSON(),
        actors: actors.map((actor) => actor.toJSON()),
      } as Movie;
    });

    // Return movie with actors using the new method
    return this.toResponse(movie);
  }

  /**
   * Update a movie by ID
   * Updates title, year, format fields and/or actors
   */
  public async updateMovie(
    id: number,
    data: UpdateMovieData
  ): Promise<MovieResponse> {
    const movie = await this.movieRepository.findById(id);

    if (!movie) {
      throw new NotFoundError(
        `Movie with id ${id} not found`,
        ERROR_CODES.MOVIE_NOT_FOUND
      );
    }

    // Prepare update data for movie fields
    const updateData: UpdateMovieInput = {};

    if (data.title !== undefined) {
      updateData.title = data.title.trim();
    }

    if (data.year !== undefined) {
      updateData.year = data.year;
    }

    if (data.format !== undefined) {
      updateData.format = data.format;
    }

    await withTransaction(async (transaction) => {
      await this.movieRepository.updateById(id, updateData, { transaction });

      if (data.actors !== undefined) {
        const actors = await this.actorRepository.findOrCreateByNames(
          data.actors,
          transaction
        );

        const actorIds = actors.map((actor) => actor.id);

        await this.movieActorRepository.replaceActorsForMovie(
          id,
          actorIds,
          transaction
        );
      }
    });

    // Return updated movie with actors
    return await this._getMovieByIdWithActors(id);
  }

  /**
   * Delete a movie by ID
   * CASCADE will automatically delete related records from movie_actors table
   * Returns 204 regardless of whether the movie existed (idempotent operation)
   */
  public async deleteMovie(id: number): Promise<void> {
    await this.movieRepository.deleteById(id);
  }

  /**
   * List movies with sorting, limit, and offset
   */
  public async listMovies(
    sort: "id" | "title" | "year" = "id",
    order: "ASC" | "DESC" = "ASC",
    limit: number = 20,
    offset: number = 0
  ): Promise<PaginatedResponse<MovieResponse>> {
    const { movies, total } = await this.movieRepository.findAllWithSorting(
      sort,
      order,
      limit,
      offset
    );

    const movieResponses = movies.map((movie) => this.toResponse(movie));

    return requestHelper.formatPaginatedResponse(
      movieResponses,
      limit,
      offset,
      total
    );
  }
}

export default MovieService;
