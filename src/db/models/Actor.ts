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
import { Movie } from "./Movie";

export class Actor extends Model<
  InferAttributes<Actor>,
  InferCreationAttributes<Actor>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare movies?: Movie[];
}

export function initializeActorModel(sequelize: Sequelize): ModelStatic<Actor> {
  return sequelize.define<Actor>(
    "Actor",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
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
      tableName: "actors",
      modelName: "Actor",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ["name"],
        },
      ],
    }
  );
}

export type ActorModelStatic = ModelStatic<Actor>;

export type CreateActorInput = Optional<
  InferCreationAttributes<Actor>,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateActorInput = Partial<Pick<InferAttributes<Actor>, "name">>;
