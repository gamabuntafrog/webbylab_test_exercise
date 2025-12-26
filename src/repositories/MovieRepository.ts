import {
  Movie,
  MovieModelStatic,
  CreateMovieInput,
  UpdateMovieInput,
} from "@db/models/Movie";
import { BaseRepository } from "./BaseRepository";

class MovieRepository extends BaseRepository<
  Movie,
  CreateMovieInput,
  UpdateMovieInput
> {
  constructor(movieModel: MovieModelStatic) {
    super(movieModel);
  }
}

export default MovieRepository;
