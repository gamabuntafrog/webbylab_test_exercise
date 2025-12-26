import { Router } from "express";
import MovieController from "@controllers/movieController";

export default function createMovieRoutes(
  movieController: MovieController
): Router {
  const router = Router();

  // Create a new movie
  router.post("/", movieController.createMovie.bind(movieController));

  return router;
}
