import { Router } from "express";

import { authorize } from "../../middleware/rbac.js";
import {
  addAdmissionNoteHandler,
  addAdmissionVitalsHandler,
  admissionDetailsHandler,
  admitPatientHandler,
  dischargeAdmissionHandler,
  ipdMastersHandler,
  ipdSummaryHandler,
  listAdmissionsHandler
} from "./ipd.controller.js";

const ipdRouter = Router();

ipdRouter.get("/masters", authorize(["admin", "doctor", "reception", "accounts", "nursing"]), ipdMastersHandler);
ipdRouter.get("/summary", authorize(["admin", "doctor", "reception", "accounts", "nursing"]), ipdSummaryHandler);
ipdRouter.get("/admissions", authorize(["admin", "doctor", "reception", "accounts", "nursing"]), listAdmissionsHandler);
ipdRouter.get("/admissions/:id", authorize(["admin", "doctor", "reception", "accounts", "nursing"]), admissionDetailsHandler);
ipdRouter.post("/admissions", authorize(["admin", "doctor", "reception", "nursing"]), admitPatientHandler);
ipdRouter.post("/admissions/:id/notes", authorize(["admin", "doctor", "nursing"]), addAdmissionNoteHandler);
ipdRouter.post("/admissions/:id/vitals", authorize(["admin", "doctor", "nursing"]), addAdmissionVitalsHandler);
ipdRouter.post("/admissions/:id/discharge", authorize(["admin", "doctor", "reception", "accounts", "nursing"]), dischargeAdmissionHandler);

export { ipdRouter };
