import express, { Application, Request, Response } from "express";
import config from "@config";
import logger from "@utilities/logger";
import sequelize from "@db/database";
import UserRepository from "@repositories/UserRepository";
import { initializeUserModel } from "@db/models/User";
import { initializeMovieModel } from "@db/models/Movie";
import { initializeActorModel } from "@db/models/Actor";
import MovieRepository from "@repositories/MovieRepository";
import ActorRepository from "@repositories/ActorRepository";
import AuthService from "@services/authService";
import UserService from "@services/userService";
import MovieService from "@services/movieService";
import AuthController from "@controllers/authController";
import UserController from "@controllers/userController";
import MovieController from "@controllers/movieController";
import createUserRoutes from "@routes/userRoutes";
import createMovieRoutes from "@routes/movieRoutes";
import { errorHandler } from "@middleware/global/errorHandler";
import { corsMiddleware } from "@middleware/global/corsMiddleware";
import { requestLogger } from "@middleware/global/requestLogger";
import { ERROR_CODES } from "@constants/errorCodes";
import createSessionRoutes from "@routes/sessionRouter";
import { AssociationRegistry } from "@db/associations";
import { initializeMovieActorModel } from "@db/models/MovieActor";
import MovieActorRepository from "@repositories/MovieActorRepository";

const app: Application = express();

// Middleware
app.use(corsMiddleware);
app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize models with Sequelize instance
const UserModel = initializeUserModel(sequelize);
const MovieModel = initializeMovieModel(sequelize);
const ActorModel = initializeActorModel(sequelize);
const MovieActorModel = initializeMovieActorModel(sequelize);

// Register model associations
const associationRegistry = new AssociationRegistry({
  User: UserModel,
  Movie: MovieModel,
  Actor: ActorModel,
  MovieActor: MovieActorModel,
});

associationRegistry.register();

// Initialize repositories with injected models
const userRepository = new UserRepository(UserModel);
const actorRepository = new ActorRepository(ActorModel);
const movieRepository = new MovieRepository(MovieModel);
const movieActorRepository = new MovieActorRepository(MovieActorModel);

// Initialize services with repositories
const authService = new AuthService(userRepository);
const userService = new UserService(userRepository);
const movieService = new MovieService(
  movieRepository,
  actorRepository,
  movieActorRepository
);

// Initialize controllers with services
const authController = new AuthController(authService);
const userController = new UserController(userService);
const movieController = new MovieController(movieService);

// Initialize routes with controllers
const sessionRoutes = createSessionRoutes(authController);
const userRoutes = createUserRoutes(userController, authController);
const movieRoutes = createMovieRoutes(movieController);

// Routes
app.use("/api/v1/sessions", sessionRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/movies", movieRoutes);

// Health check route
app.get("/health", function (req: Request, res: Response) {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

// 404 handler
app.use(function (req: Request, res: Response) {
  res.status(404).json({
    success: false,
    code: ERROR_CODES.NOT_FOUND,
    message: "Route not found",
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(config.PORT, function () {
  logger.info(`Server is running on port ${config.PORT}`);
});

export default app;
