import {
  addAdmissionNote,
  addAdmissionVitals,
  admitPatient,
  dischargeAdmission,
  getAdmissionDetails,
  getIpdMasters,
  getIpdSummary,
  listAdmissions
} from "./ipd.service.js";

export function ipdMastersHandler(_req, res, next) {
  try {
    res.json(getIpdMasters());
  } catch (error) {
    next(error);
  }
}

export function ipdSummaryHandler(_req, res, next) {
  try {
    res.json(getIpdSummary());
  } catch (error) {
    next(error);
  }
}

export function listAdmissionsHandler(req, res, next) {
  try {
    res.json({ items: listAdmissions(req.query) });
  } catch (error) {
    next(error);
  }
}

export function admissionDetailsHandler(req, res, next) {
  try {
    res.json(getAdmissionDetails(req.params.id));
  } catch (error) {
    next(error);
  }
}

export function admitPatientHandler(req, res, next) {
  try {
    res.status(201).json({ item: admitPatient(req.body, req.user.sub), message: "Patient admitted successfully." });
  } catch (error) {
    next(error);
  }
}

export function addAdmissionNoteHandler(req, res, next) {
  try {
    res.status(201).json({ item: addAdmissionNote(req.params.id, req.body, req.user.sub), message: "Clinical note added successfully." });
  } catch (error) {
    next(error);
  }
}

export function addAdmissionVitalsHandler(req, res, next) {
  try {
    res.status(201).json({ item: addAdmissionVitals(req.params.id, req.body, req.user.sub), message: "Vitals recorded successfully." });
  } catch (error) {
    next(error);
  }
}

export function dischargeAdmissionHandler(req, res, next) {
  try {
    res.json({ item: dischargeAdmission(req.params.id, req.body, req.user.sub), message: "Patient discharged successfully." });
  } catch (error) {
    next(error);
  }
}
