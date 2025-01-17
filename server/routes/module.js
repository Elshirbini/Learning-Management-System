import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { restrictTo } from "../middlewares/restricting.js";
import {
  createModule,
  deleteModule,
  getModules,
  updateModule,
} from "../controllers/module.js";

const router = express.Router();

router.get(
  "/get-modules/:courseId",
  verifyToken,

  getModules
);

router.post(
  "/create-module/:courseId",
  verifyToken,
  restrictTo("admin", "instructor"),
  createModule
);

router.put(
  "/update-module/:moduleId",
  verifyToken,
  restrictTo("admin", "instructor"),
  updateModule
);

router.delete(
  "/delete-module/:moduleId",
  verifyToken,
  restrictTo("admin", "instructor"),
  deleteModule
);

export const modulesRoutes = router;
