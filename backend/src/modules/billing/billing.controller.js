import {
  collectPayment,
  createBill,
  getBillDetails,
  getBillingMasters,
  getBillingSummary,
  listBills,
  listPayments
} from "./billing.service.js";

export function billingMastersHandler(_req, res, next) {
  try {
    res.json(getBillingMasters());
  } catch (error) {
    next(error);
  }
}

export function listBillsHandler(req, res, next) {
  try {
    res.json({ items: listBills(req.query) });
  } catch (error) {
    next(error);
  }
}

export function listPaymentsHandler(req, res, next) {
  try {
    res.json({ items: listPayments(req.query) });
  } catch (error) {
    next(error);
  }
}

export function createBillHandler(req, res, next) {
  try {
    res.status(201).json({ item: createBill({ ...req.body, createdBy: req.user.sub }), message: "Bill created successfully." });
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
