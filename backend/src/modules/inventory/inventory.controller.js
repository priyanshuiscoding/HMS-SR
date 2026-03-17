import {
  getInventoryMasters,
  listInventoryBatches,
  listStockTransactions,
  receiveStock
} from "./inventory.service.js";

export function inventoryMastersHandler(_req, res, next) {
  try {
    res.json(getInventoryMasters());
  } catch (error) {
    next(error);
  }
}

export function inventoryBatchesHandler(req, res, next) {
  try {
    res.json({ items: listInventoryBatches(req.query) });
  } catch (error) {
    next(error);
  }
}

export function stockTransactionsHandler(req, res, next) {
  try {
    res.json({ items: listStockTransactions(req.query) });
  } catch (error) {
    next(error);
  }
}

export function receiveStockHandler(req, res, next) {
  try {
    const item = receiveStock(req.body);
    res.status(201).json({ item, message: "Stock batch received successfully." });
  } catch (error) {
    next(error);
  }
}
