import MovieRepository from "@repositories/MovieRepository";
import ActorRepository from "@repositories/ActorRepository";
import MovieActorRepository from "@repositories/MovieActorRepository";
import { Movie, MovieFormat, CreateMovieInput } from "@db/models/Movie";
import { withTransaction } from "@db/utilities/transaction";
import { NotFoundError } from "@errors/AppError";
import { ERROR_CODES } from "@constants/errorCodes";

export interface CreateMovieData {
  title: string;
  year: number;
  format: MovieFormat;
  actors: string[];
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
   * Get a movie by ID with actors
   */
  public async getMovieByIdWithActors(id: number): Promise<MovieResponse> {
    // Get movie
    const movie = await this.movieRepository.findById(id);
    if (!movie) {
      throw new NotFoundError(
        `Movie with id ${id} not found`,
        ERROR_CODES.MOVIE_NOT_FOUND
      );
    }

    // Get actor IDs for this movie
    const actorIds = await this.movieActorRepository.getActorIdsByMovieId(
      movie.id
    );

    // Get actors by IDs
    const actors = await this.actorRepository.findByIds(actorIds);

    // Combine movie with actors
    const movieWithActors = {
      ...movie.toJSON(),
      actors,
    } as Movie;

    return this.toResponse(movieWithActors);
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
   * Delete a movie by ID
   * CASCADE will automatically delete related records from movie_actors table
   * Returns 204 regardless of whether the movie existed (idempotent operation)
   */
  public async deleteMovie(id: number): Promise<void> {
    await this.movieRepository.deleteById(id);
  }
}

export default MovieService;
