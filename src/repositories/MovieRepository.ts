import {
  Movie,
  MovieModelStatic,
  CreateMovieInput,
  UpdateMovieInput,
} from "@db/models/Movie";
import { Actor } from "@db/models/Actor";
import { BaseRepository } from "./BaseRepository";
import { Models } from "@db/associations";
import {
  Op,
  literal,
  WhereOptions,
  InferAttributes,
  Model,
  IncludeOptions,
} from "sequelize";

// Type for where clauses that support Sequelize operators
type WhereWithOperators<T extends Model> = WhereOptions<InferAttributes<T>> & {
  [Op.or]?: unknown[];
  [Op.and]?: unknown[];
  [Op.not]?: unknown;
};

class MovieRepository extends BaseRepository<
  Movie,
  CreateMovieInput,
  UpdateMovieInput
> {
  constructor(movieModel: MovieModelStatic, models: Models) {
    super(movieModel, models);
  }

  /**
   * Find a movie by ID with actors
   */
  public async findByIdWithActors(id: number): Promise<Movie | null> {
    const ActorModel = this.getModel("Actor");

    return await this.model.findByPk(id, {
      include: [
        {
          model: ActorModel,
          as: "actors",
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
      ],
    });
  }

  /**
   * Find all movies with sorting, limit, offset, and filtering
   * Returns both the movies and the total count
   */
  public async findAllWithSorting(
    sort: "id" | "title" | "year" = "id",
    order: "ASC" | "DESC" = "ASC",
    limit: number = 20,
    offset: number = 0,
    filters: {
      actor?: string;
      title?: string;
      search?: string;
    }
  ): Promise<{ movies: Movie[]; total: number }> {
    const ActorModel = this.getModel("Actor");

    // Build where clause for movie filters
    const movieWhere: WhereWithOperators<Movie> = {};

    // Build where clause for actor filters
    const actorWhere: WhereWithOperators<Actor> = {};

    // Combined search: search both title and actor name
    // This takes precedence over individual filters
    if (filters.search) {
      // For search, we want movies where title matches OR actor name matches
      // SQLite doesn't support ILIKE, so we use UPPER() for case-insensitive matching
      // Use parameterized queries to prevent SQL injection
      const escapedSearch = filters.search.replace(/'/g, "''");
      // In Sequelize literal queries, reference the outer table using the model name
      // Sequelize uses the model name as the table alias in generated SQL
      const modelName = this.model.name;
      movieWhere[Op.or] = [
        literal(`UPPER(title) LIKE UPPER('%${escapedSearch}%')`),
        literal(`EXISTS (
            SELECT 1 FROM movie_actors ma
            INNER JOIN actors a ON ma.actor_id = a.id
            WHERE ma.movie_id = "${modelName}".id
            AND UPPER(a.name) LIKE UPPER('%${escapedSearch}%')
          )`),
      ];
    } else {
      // Individual filters (only apply if search is not provided)
      // Filter by title (exact match or partial match)
      // SQLite doesn't support ILIKE, so we use UPPER() for case-insensitive matching
      if (filters.title) {
        const escapedTitle = filters.title.replace(/'/g, "''");
        movieWhere[Op.and] = [
          literal(`UPPER(title) LIKE UPPER('%${escapedTitle}%')`),
        ];
      }

      // Filter by actor name (exact match or partial match)
      // SQLite doesn't support ILIKE, so we use UPPER() for case-insensitive matching
      if (filters.actor) {
        const escapedActor = filters.actor.replace(/'/g, "''");
        actorWhere[Op.and] = [
          literal(`UPPER(name) LIKE UPPER('%${escapedActor}%')`),
        ];
      }
    }

    const includeOptions: IncludeOptions = {
      model: ActorModel,
      as: "actors",
      attributes: ["id", "name"],
      through: { attributes: [] },
    };

    // Only add actor where clause if we have actor filters (but not for search, as we handle it via subquery)
    // Check for both string keys and symbol keys (Op.and, Op.or, etc.)
    const hasActorFilters =
      Reflect.ownKeys(actorWhere).length > 0 && !filters?.search;
    if (hasActorFilters) {
      includeOptions.where = actorWhere;
      includeOptions.required = true; // Use INNER JOIN when filtering by actor
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const findOptions: any = {
      include: [includeOptions],
      order: [[sort, order]],
      limit,
      offset,
      distinct: true, // Important: ensures count is accurate when using includes
    };

    // Only add movie where clause if we have movie filters
    // Check for both string keys and symbol keys (Op.and, Op.or, etc.)
    const hasMovieFilters = Reflect.ownKeys(movieWhere).length > 0;
    if (hasMovieFilters) {
      findOptions.where = movieWhere;
    }

    const model = this.model;

    const result = await model.findAndCountAll(
      findOptions as Parameters<typeof model.findAndCountAll>[0]
    );

    return {
      movies: result.rows as Movie[],
      total: result.count,
    };
  }
}

export default MovieRepository;
