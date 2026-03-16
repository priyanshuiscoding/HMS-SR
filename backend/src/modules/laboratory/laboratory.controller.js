import { createLabOrder, getLabMasters, listLabOrders } from "./laboratory.service.js";

export function mastersHandler(_req, res, next) {
  try {
    res.json(getLabMasters());
  } catch (error) {
    next(error);
  }
}

export function listOrdersHandler(req, res, next) {
  try {
    res.json({ items: listLabOrders(req.query) });
  } catch (error) {
    next(error);
  }
}

export function createOrderHandler(req, res, next) {
  try {
    res.status(201).json({ item: createLabOrder(req.body), message: "Lab order created successfully." });
  } catch (error) {
    next(error);
  }
}
