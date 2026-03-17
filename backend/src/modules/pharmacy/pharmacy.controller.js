import {
  dispensePrescription,
  getPharmacyAlerts,
  getPharmacyMasters,
  getPharmacyStock,
  listDispensations,
  listPrescriptionQueue
} from "./pharmacy.service.js";

export function pharmacyMastersHandler(_req, res, next) {
  try {
    res.json(getPharmacyMasters());
  } catch (error) {
    next(error);
  }
}

export function pharmacyStockHandler(_req, res, next) {
  try {
    res.json({ items: getPharmacyStock(), alerts: getPharmacyAlerts() });
  } catch (error) {
    next(error);
  }
}

export function prescriptionQueueHandler(req, res, next) {
  try {
    res.json({ items: listPrescriptionQueue(req.query) });
  } catch (error) {
    next(error);
  }
}

export function dispensationsHandler(req, res, next) {
  try {
    res.json({ items: listDispensations(req.query) });
  } catch (error) {
    next(error);
  }
}

export function dispenseHandler(req, res, next) {
  try {
    const item = dispensePrescription(req.params.prescriptionId, req.body, req.user.sub);
    res.status(201).json({ item, message: "Prescription dispensed successfully." });
  } catch (error) {
    next(error);
  }
}
