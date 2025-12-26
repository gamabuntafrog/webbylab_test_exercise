import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  ModelStatic,
  Optional,
  Sequelize,
} from "sequelize";

export class MovieActor extends Model<
  InferAttributes<MovieActor>,
  InferCreationAttributes<MovieActor>
> {
  declare id: CreationOptional<number>;
  declare movieId: number;
  declare actorId: number;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

export function initializeMovieActorModel(
  sequelize: Sequelize
): ModelStatic<MovieActor> {
  const model = sequelize.define<MovieActor>(
    "MovieActor",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      movieId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "movie_id",
        references: {
          model: "movies",
          key: "id",
        },
      },
      actorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "actor_id",
        references: {
          model: "actors",
          key: "id",
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "created_at",
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "updated_at",
      },
    },
    {
      tableName: "movie_actors",
      modelName: "MovieActor",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["movie_id", "actor_id"],
          name: "movie_actors_unique",
        },
      ],
    }
  );

  return model;
}

export type MovieActorModelStatic = ModelStatic<MovieActor>;

export type CreateMovieActorInput = Optional<
  InferCreationAttributes<MovieActor>,
  "id" | "createdAt" | "updatedAt"
>;
