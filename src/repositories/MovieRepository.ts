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
}

export default MovieRepository;
