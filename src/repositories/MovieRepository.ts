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
}

export default MovieRepository;
