import {
  createPatient,
  getPatientById,
  getPatientHistory,
  listPatients,
  updatePatient
} from "./patients.service.js";

export function listPatientsHandler(req, res, next) {
  try {
    res.json({ items: listPatients(req.query) });
  } catch (error) {
    next(error);
  }
}

export function getPatientHandler(req, res, next) {
  try {
    res.json({ item: getPatientById(req.params.id) });
  } catch (error) {
    next(error);
  }
}

export function searchPatientsHandler(req, res, next) {
  try {
    res.json({ items: listPatients({ search: req.query.q || req.query.search || "" }) });
  } catch (error) {
    next(error);
  }
}

export function createPatientHandler(req, res, next) {
  try {
    const patient = createPatient(req.body, req.user.sub);
    res.status(201).json({ item: patient, message: "Patient registered successfully." });
  } catch (error) {
    next(error);
  }
}

export function updatePatientHandler(req, res, next) {
  try {
    res.json({ item: updatePatient(req.params.id, req.body), message: "Patient updated successfully." });
  } catch (error) {
    next(error);
  }
}

export function patientHistoryHandler(req, res, next) {
  try {
    res.json(getPatientHistory(req.params.id));
  } catch (error) {
    next(error);
  }
}
