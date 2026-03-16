import { Router } from "express";

import { authorize } from "../../middleware/rbac.js";
import {
  createPatientHandler,
  getPatientHandler,
  listPatientsHandler,
  patientHistoryHandler,
  searchPatientsHandler,
  updatePatientHandler
} from "./patients.controller.js";

const patientsRouter = Router();

patientsRouter.get("/", authorize(["admin", "reception", "doctor", "hr"]), listPatientsHandler);
patientsRouter.post("/", authorize(["admin", "reception"]), createPatientHandler);
patientsRouter.get("/search", authorize(["admin", "reception", "doctor"]), searchPatientsHandler);
patientsRouter.get("/:id", authorize(["admin", "reception", "doctor"]), getPatientHandler);
patientsRouter.put("/:id", authorize(["admin", "reception"]), updatePatientHandler);
patientsRouter.get("/:id/history", authorize(["admin", "doctor", "reception"]), patientHistoryHandler);

export { patientsRouter };
