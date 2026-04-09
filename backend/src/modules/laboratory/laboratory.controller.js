import {
  collectLabSample,
  createLabBill,
  createLabOrder,
  getLabMasters,
  getLabOrderDetails,
  getLabSummary,
  listLabOrders,
  saveLabResults
} from "./laboratory.service.js";

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

export function summaryHandler(_req, res, next) {
  try {
    res.json(getLabSummary());
  } catch (error) {
    next(error);
  }
}

export function orderDetailsHandler(req, res, next) {
  try {
    res.json(getLabOrderDetails(req.params.id));
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

export function collectSampleHandler(req, res, next) {
  try {
    res.json({ item: collectLabSample(req.params.id, req.body, req.user.sub), message: "Sample collected successfully." });
  } catch (error) {
    next(error);
  }
}

export function saveResultsHandler(req, res, next) {
  try {
    res.json({ item: saveLabResults(req.params.id, req.body, req.user.sub), message: "Lab results saved successfully." });
  } catch (error) {
    next(error);
  }
}

export function createBillHandler(req, res, next) {
  try {
    res.json({ item: createLabBill(req.params.id, req.body, req.user.sub), message: "Lab bill created successfully." });
  } catch (error) {
    next(error);
  }
}
