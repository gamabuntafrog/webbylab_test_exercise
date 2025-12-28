import {
  Movie,
  MovieModelStatic,
  CreateMovieInput,
  UpdateMovieInput,
} from "@db/models/Movie";
import { BaseRepository } from "./BaseRepository";
import { Models } from "@db/associations";
import { FindOptions, InferAttributes } from "sequelize";

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
   */
  public async findAllWithSorting(
    sort: "id" | "title" | "year" = "id",
    order: "ASC" | "DESC" = "ASC",
    limit: number = 20,
    offset: number = 0
  ): Promise<Movie[]> {
    const ActorModel = this.getModel("Actor");

    const findOptions: FindOptions<InferAttributes<Movie>> = {
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
    };

    return await this.find(findOptions);
  }
}

export default MovieRepository;
