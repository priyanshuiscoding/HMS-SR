import { Router } from "express";

import { authorize } from "../../middleware/rbac.js";
import {
  billDetailsHandler,
  billingSummaryHandler,
  collectPaymentHandler,
  createBillHandler,
  listBillsHandler
} from "./billing.controller.js";

const billingRouter = Router();

billingRouter.get("/summary", authorize(["admin", "accounts", "doctor", "reception"]), billingSummaryHandler);
billingRouter.get("/bills", authorize(["admin", "accounts", "doctor", "reception"]), listBillsHandler);
billingRouter.get("/bills/:id", authorize(["admin", "accounts", "doctor", "reception"]), billDetailsHandler);
billingRouter.post("/bills", authorize(["admin", "accounts", "doctor", "reception"]), createBillHandler);
billingRouter.post("/bills/:id/payments", authorize(["admin", "accounts", "reception"]), collectPaymentHandler);

export { billingRouter };
