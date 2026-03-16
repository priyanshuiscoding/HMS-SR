import { createBill, listBills } from "./billing.service.js";

export function listBillsHandler(req, res, next) {
  try {
    res.json({ items: listBills(req.query) });
  } catch (error) {
    next(error);
  }
}

export function createBillHandler(req, res, next) {
  try {
    res.status(201).json({ item: createBill(req.body), message: "Bill created successfully." });
  } catch (error) {
    next(error);
  }
}
