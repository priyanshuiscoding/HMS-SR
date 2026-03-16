import { Router } from "express";

import { authorize } from "../../middleware/rbac.js";
import { createOrderHandler, listOrdersHandler, mastersHandler } from "./laboratory.controller.js";

const laboratoryRouter = Router();

laboratoryRouter.get("/tests", authorize(["admin", "doctor", "reception", "lab"]), mastersHandler);
laboratoryRouter.get("/orders", authorize(["admin", "doctor", "lab", "reception"]), listOrdersHandler);
laboratoryRouter.post("/orders", authorize(["admin", "doctor"]), createOrderHandler);

export { laboratoryRouter };
