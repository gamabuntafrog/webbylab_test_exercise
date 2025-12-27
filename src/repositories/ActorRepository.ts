import {
  Actor,
  ActorModelStatic,
  CreateActorInput,
  UpdateActorInput,
} from "@db/models/Actor";
import { BaseRepository } from "./BaseRepository";
import { Transaction } from "sequelize";
import { Models } from "@db/associations";

class ActorRepository extends BaseRepository<
  Actor,
  CreateActorInput,
  UpdateActorInput
> {
  constructor(actorModel: ActorModelStatic, models: Models) {
    super(actorModel, models);
  }

  /**
   * Find an actor by name or create if doesn't exist
   */
  public async findOrCreateByName(
    name: string,
    transaction?: Transaction
  ): Promise<Actor> {
    const [actor] = await this.model.findOrCreate({
      where: { name: name.trim() },
      defaults: { name: name.trim() },
      transaction,
    });

    return actor;
  }

  /**
   * Find or create multiple actors by names
   */
  public async findOrCreateByNames(
    names: string[],
    transaction?: Transaction
  ): Promise<Actor[]> {
    return await Promise.all(
      names.map((name) => this.findOrCreateByName(name, transaction))
    );
  }

  /**
   * Find actors by IDs
   */
  public async findByIds(ids: number[]): Promise<Actor[]> {
    if (ids.length === 0) {
      return [];
    }

    return await this.model.findAll({
      where: {
        id: ids,
      },
      attributes: ["id", "name"],
    });
  }
}

export default ActorRepository;
