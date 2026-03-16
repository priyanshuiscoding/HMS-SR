import { Router } from "express";

import { authorize } from "../../middleware/rbac.js";
import { createBillHandler, listBillsHandler } from "./billing.controller.js";

const billingRouter = Router();

billingRouter.get("/bills", authorize(["admin", "accounts", "doctor", "reception"]), listBillsHandler);
billingRouter.post("/bills", authorize(["admin", "accounts", "doctor", "reception"]), createBillHandler);

export { billingRouter };
