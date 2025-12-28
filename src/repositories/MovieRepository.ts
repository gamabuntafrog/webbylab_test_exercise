import {
  Movie,
  MovieModelStatic,
  CreateMovieInput,
  UpdateMovieInput,
} from "@db/models/Movie";
import { BaseRepository } from "./BaseRepository";
import { Models } from "@db/associations";

class MovieRepository extends BaseRepository<
  Movie,
  CreateMovieInput,
  UpdateMovieInput
> {
  constructor(movieModel: MovieModelStatic, models: Models) {
    super(movieModel, models);
  }

  /**
   * Find a movie by ID with actors
   */
  public async findByIdWithActors(id: number): Promise<Movie | null> {
    const ActorModel = this.getModel("Actor");

    return await this.model.findByPk(id, {
      include: [
        {
          model: ActorModel,
          as: "actors",
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
      ],
    });
  }

  /**
   * Find all movies with sorting, limit, and offset
   * Returns both the movies and the total count
   */
  public async findAllWithSorting(
    sort: "id" | "title" | "year" = "id",
    order: "ASC" | "DESC" = "ASC",
    limit: number = 20,
    offset: number = 0
  ): Promise<{ movies: Movie[]; total: number }> {
    const ActorModel = this.getModel("Actor");

    const findOptions = {
      include: [
        {
          model: ActorModel,
          as: "actors",
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
      ],
      order: [[sort, order]],
      limit,
      offset,
      distinct: true, // Important: ensures count is accurate when using includes
    };

    const { rows: movies, count } = await this.model.findAndCountAll(
      findOptions as unknown as Parameters<typeof this.model.findAndCountAll>[0]
    );

    return {
      movies: movies as Movie[],
      total: count,
    };
  }
}

export default MovieRepository;
