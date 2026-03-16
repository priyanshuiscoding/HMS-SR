import { Router } from "express";

import { authorize } from "../../middleware/rbac.js";
import { departmentsListHandler, doctorsListHandler } from "./users.controller.js";

const usersRouter = Router();

usersRouter.get("/doctors", authorize(["admin", "reception", "doctor"]), doctorsListHandler);
usersRouter.get("/departments", authorize(["admin", "reception", "doctor", "hr"]), departmentsListHandler);

export { usersRouter };
