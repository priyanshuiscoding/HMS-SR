import {
  completeVisit,
  createVisit,
  getOpdMasters,
  getQueue,
  getVisitDetails,
  saveAssessment,
  savePrescription,
  saveVitals
} from "./opd.service.js";

export function queueHandler(req, res, next) {
  try {
    res.json({ items: getQueue(req.query.date, req.query.doctorId) });
  } catch (error) {
    next(error);
  }
}

export function createVisitHandler(req, res, next) {
  try {
    res.status(201).json({ item: createVisit(req.body), message: "OPD visit created successfully." });
  } catch (error) {
    next(error);
  }
}

export function visitDetailsHandler(req, res, next) {
  try {
    res.json(getVisitDetails(req.params.id));
  } catch (error) {
    next(error);
  }
}

export function vitalsHandler(req, res, next) {
  try {
    res.json({ item: saveVitals(req.params.id, req.body), message: "Vitals updated successfully." });
  } catch (error) {
    next(error);
  }
}

export function assessmentSaveHandler(req, res, next) {
  try {
    res.json({
      item: saveAssessment(req.params.id, req.body, req.user.sub),
      message: "Ayurvedic assessment saved successfully."
    });
  } catch (error) {
    next(error);
  }
}

export function prescriptionSaveHandler(req, res, next) {
  try {
    res.json({
      item: savePrescription(req.params.id, req.body, req.user.sub),
      message: "Prescription saved successfully."
    });
  } catch (error) {
    next(error);
  }
}

export function completeVisitHandler(req, res, next) {
  try {
    res.json({ item: completeVisit(req.params.id), message: "Consultation completed successfully." });
  } catch (error) {
    next(error);
  }
}

export function mastersHandler(_req, res, next) {
  try {
    res.json(getOpdMasters());
  } catch (error) {
    next(error);
  }
}
