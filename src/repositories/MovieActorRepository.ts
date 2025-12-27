import {
  MovieActor,
  MovieActorModelStatic,
  CreateMovieActorInput,
} from "@db/models/MovieActor";
import { BaseRepository } from "./BaseRepository";
import { Transaction } from "sequelize";

class MovieActorRepository extends BaseRepository<
  MovieActor,
  CreateMovieActorInput,
  never // No update operations for junction table
> {
  constructor(movieActorModel: MovieActorModelStatic) {
    super(movieActorModel);
  }

  /**
   * Add multiple actors to a movie
   */
  public async addActorsToMovie(
    movieId: number,
    actorIds: number[],
    transaction?: Transaction
  ): Promise<void> {
    if (actorIds.length === 0) {
      return;
    }

    const records: CreateMovieActorInput[] = actorIds.map((actorId) => ({
      movieId,
      actorId,
    }));

    // Use bulkCreate with ignoreDuplicates option
    await this.model.bulkCreate(records, {
      ignoreDuplicates: true,
      transaction,
    });
  }

  /**
   * Remove actors from a movie
   */
  public async removeActorsFromMovie(
    movieId: number,
    actorIds: number[],
    transaction?: Transaction
  ): Promise<void> {
    if (actorIds.length === 0) {
      return;
    }

    await this.model.destroy({
      where: {
        movieId,
        actorId: actorIds,
      },
      transaction,
    });
  }

  /**
   * Replace all actors for a movie (remove all existing and add new ones)
   */
  public async replaceActorsForMovie(
    movieId: number,
    actorIds: number[],
    transaction?: Transaction
  ): Promise<void> {
    // Remove all existing actors for this movie
    await this.model.destroy({
      where: { movieId },
      transaction,
    });

    // Add new actors
    await this.addActorsToMovie(movieId, actorIds, transaction);
  }

  /**
   * Get actor IDs for a movie
   */
  public async getActorIdsByMovieId(movieId: number): Promise<number[]> {
    const records = await this.model.findAll({
      where: { movieId },
      attributes: ["actorId"],
    });

    return records.map((record) => record.actorId);
  }
}

export default MovieActorRepository;
