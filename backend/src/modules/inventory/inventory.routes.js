import { Router } from "express";

import { authorize } from "../../middleware/rbac.js";
import {
  inventoryBatchesHandler,
  inventoryMastersHandler,
  receiveStockHandler,
  stockTransactionsHandler
} from "./inventory.controller.js";

const inventoryRouter = Router();

inventoryRouter.get("/masters", authorize(["admin", "pharmacy", "accounts"]), inventoryMastersHandler);
inventoryRouter.get("/batches", authorize(["admin", "pharmacy", "accounts"]), inventoryBatchesHandler);
inventoryRouter.get("/transactions", authorize(["admin", "pharmacy", "accounts"]), stockTransactionsHandler);
inventoryRouter.post("/receive", authorize(["admin", "pharmacy"]), receiveStockHandler);

export { inventoryRouter };
