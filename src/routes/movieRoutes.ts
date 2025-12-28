import { Router } from "express";
import multer from "multer";
import MovieController from "@controllers/movieController";

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept text files or files with .txt extension
    if (
      file.mimetype === "text/plain" ||
      file.mimetype === "text/txt" ||
      file.originalname.toLowerCase().endsWith(".txt")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only text files (.txt) are allowed"));
    }
  },
});

export default function createMovieRoutes(
  movieController: MovieController
): Router {
  const router = Router();

  // Import movies from file
  router.post(
    "/import",
    upload.single("movies"),
    movieController.importMovies.bind(movieController)
  );

  // List movies with sorting
  router.get("/", movieController.listMovies.bind(movieController));

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
