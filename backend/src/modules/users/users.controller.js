import { getDepartments, getDoctors } from "../../data/store.js";

export function doctorsListHandler(_req, res) {
  res.json({ items: getDoctors() });
}

export function departmentsListHandler(_req, res) {
  res.json({ items: getDepartments() });
}
