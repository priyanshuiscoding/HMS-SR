import { Router } from "express";

import { authorize } from "../../middleware/rbac.js";
import {
  departmentsListHandler,
  doctorsListHandler,
  usersListHandler,
  usersSummaryHandler
} from "./users.controller.js";

const usersRouter = Router();

usersRouter.get("/", authorize(["admin", "hr"]), usersListHandler);
usersRouter.get("/summary", authorize(["admin", "hr"]), usersSummaryHandler);
usersRouter.get("/doctors", authorize(["admin", "reception", "doctor"]), doctorsListHandler);
usersRouter.get("/departments", authorize(["admin", "reception", "doctor", "hr"]), departmentsListHandler);

export { usersRouter };
