import { collectPayment, createBill, getBillDetails, getBillingSummary, listBills } from "./billing.service.js";

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

export function billingSummaryHandler(_req, res, next) {
  try {
    res.json(getBillingSummary());
  } catch (error) {
    next(error);
  }
}

export function billDetailsHandler(req, res, next) {
  try {
    res.json(getBillDetails(req.params.id));
  } catch (error) {
    next(error);
  }
}

export function collectPaymentHandler(req, res, next) {
  try {
    res.status(201).json({
      ...collectPayment(req.params.id, { ...req.body, receivedBy: req.user.sub }),
      message: "Payment collected successfully."
    });
  } catch (error) {
    next(error);
  }
}
