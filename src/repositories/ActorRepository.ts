import {
  Actor,
  ActorModelStatic,
  CreateActorInput,
  UpdateActorInput,
} from "@db/models/Actor";
import { BaseRepository } from "./BaseRepository";

class ActorRepository extends BaseRepository<
  Actor,
  CreateActorInput,
  UpdateActorInput
> {
  constructor(actorModel: ActorModelStatic) {
    super(actorModel);
  }
}

export default ActorRepository;
