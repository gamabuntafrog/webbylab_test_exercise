import { QueryInterface, DataTypes } from "sequelize";

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Check if id column already exists
  const tableDescription = await queryInterface.describeTable("movie_actors");

  if (!tableDescription.id) {
    // Add id column as primary key with auto-increment
    await queryInterface.addColumn("movie_actors", "id", {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const tableDescription = await queryInterface.describeTable("movie_actors");

  if (tableDescription.id) {
    await queryInterface.removeColumn("movie_actors", "id");
  }
}
