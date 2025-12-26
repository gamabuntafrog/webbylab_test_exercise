import { ModelStatic } from "sequelize";
import { User } from "./models/User";
import { Movie } from "./models/Movie";
import { Actor } from "./models/Actor";
import { MovieActor } from "./models/MovieActor";

export interface Models {
  User: ModelStatic<User>;
  Movie: ModelStatic<Movie>;
  Actor: ModelStatic<Actor>;
  MovieActor: ModelStatic<MovieActor>;
}

/**
 * Centralized registry for setting up all model associations.
 * Associations are grouped by domain/feature for better organization.
 */
export class AssociationRegistry {
  constructor(private models: Models) {}

  /**
   * Sets up Movie ↔ Actor associations
   *
   * This group includes:
   * - Many-to-Many relationship between Movie and Actor through MovieActor junction model
   */
  private setupMovieActorAssociations(): void {
    const { Movie, Actor, MovieActor } = this.models;

    Movie.belongsToMany(Actor, {
      through: MovieActor,
      foreignKey: "movie_id",
      otherKey: "actor_id",
      as: "actors",
    });

    Actor.belongsToMany(Movie, {
      through: MovieActor,
      foreignKey: "actor_id",
      otherKey: "movie_id",
      as: "movies",
    });
  }

  /**
   * Registers all model associations by calling all association group methods.
   * Add new association groups here as they are created.
   */
  public register(): void {
    this.setupMovieActorAssociations();
  }
}
