import { Router } from "express";
import MovieController from "@controllers/movieController";

export default function createMovieRoutes(
  movieController: MovieController
): Router {
  const router = Router();

  // Create a new movie
  router.post("/", movieController.createMovie.bind(movieController));

  // Get a movie by ID
  router.get("/:id", movieController.getMovieById.bind(movieController));

  // Update a movie by ID
  router.patch("/:id", movieController.updateMovie.bind(movieController));

  // Delete a movie by ID
  router.delete("/:id", movieController.deleteMovie.bind(movieController));

  return router;
}
