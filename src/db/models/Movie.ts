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
import { Actor } from "./Actor";

export enum MovieFormat {
  VHS = "VHS",
  DVD = "DVD",
  BLU_RAY = "Blu-ray",
}

export class Movie extends Model<
  InferAttributes<Movie>,
  InferCreationAttributes<Movie>
> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare year: number;
  declare format: MovieFormat;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare actors?: Actor[];
}

export function initializeMovieModel(sequelize: Sequelize): ModelStatic<Movie> {
  return sequelize.define<Movie>(
    "Movie",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1888, // First movie ever made
          max: new Date().getFullYear(),
        },
      },
      format: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          isIn: [Object.values(MovieFormat)],
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
      tableName: "movies",
      modelName: "Movie",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ["title"],
        },
        {
          fields: ["year"],
        },
      ],
    }
  );
}

export type MovieModelStatic = ModelStatic<Movie>;

export type CreateMovieInput = Optional<
  InferCreationAttributes<Movie>,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateMovieInput = Partial<
  Pick<InferAttributes<Movie>, "title" | "year" | "format">
>;
