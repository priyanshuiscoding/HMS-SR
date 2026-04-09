import { Router } from "express";

import { authorize } from "../../middleware/rbac.js";
import {
  billDetailsHandler,
  billingMastersHandler,
  billingSummaryHandler,
  collectPaymentHandler,
  createBillHandler,
  listBillsHandler,
  listPaymentsHandler
} from "./billing.controller.js";

const billingRouter = Router();

billingRouter.get("/masters", authorize(["admin", "accounts", "doctor", "reception"]), billingMastersHandler);
billingRouter.get("/summary", authorize(["admin", "accounts", "doctor", "reception"]), billingSummaryHandler);
billingRouter.get("/bills", authorize(["admin", "accounts", "doctor", "reception"]), listBillsHandler);
billingRouter.get("/payments", authorize(["admin", "accounts", "doctor", "reception"]), listPaymentsHandler);
billingRouter.get("/bills/:id", authorize(["admin", "accounts", "doctor", "reception"]), billDetailsHandler);
billingRouter.post("/bills", authorize(["admin", "accounts", "doctor", "reception"]), createBillHandler);
billingRouter.post("/bills/:id/payments", authorize(["admin", "accounts", "reception"]), collectPaymentHandler);

export { billingRouter };
