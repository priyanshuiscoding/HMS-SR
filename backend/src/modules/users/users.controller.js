import { getDepartments, getDoctors, getUsers, getUsersSummary } from "../../data/store.js";

export function usersListHandler(_req, res) {
  res.json({ items: getUsers() });
}

export function usersSummaryHandler(_req, res) {
  res.json(getUsersSummary());
}

export function doctorsListHandler(_req, res) {
  res.json({ items: getDoctors() });
}

export function departmentsListHandler(_req, res) {
  res.json({ items: getDepartments() });
}
