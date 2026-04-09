import {
  completePanchkarmaSession,
  createPanchkarmaSchedule,
  getPanchkarmaMasters,
  getPanchkarmaScheduleDetails,
  getPanchkarmaSummary,
  getPanchkarmaTherapies,
  listPanchkarmaSchedules,
  startPanchkarmaSession
} from "./panchkarma.service.js";

export function panchkarmaTherapiesHandler(_req, res, next) {
  try {
    res.json({ items: getPanchkarmaTherapies() });
  } catch (error) {
    next(error);
  }
}

export function panchkarmaMastersHandler(_req, res, next) {
  try {
    res.json(getPanchkarmaMasters());
  } catch (error) {
    next(error);
  }
}

export function panchkarmaSummaryHandler(_req, res, next) {
  try {
    res.json(getPanchkarmaSummary());
  } catch (error) {
    next(error);
  }
}

export function listPanchkarmaSchedulesHandler(req, res, next) {
  try {
    res.json({ items: listPanchkarmaSchedules(req.query) });
  } catch (error) {
    next(error);
  }
}

export function panchkarmaScheduleDetailsHandler(req, res, next) {
  try {
    res.json(getPanchkarmaScheduleDetails(req.params.id));
  } catch (error) {
    next(error);
  }
}

export function createPanchkarmaScheduleHandler(req, res, next) {
  try {
    res.status(201).json({
      item: createPanchkarmaSchedule(req.body, req.user.sub),
      message: "Panchkarma session scheduled successfully."
    });
  } catch (error) {
    next(error);
  }
}

export function startPanchkarmaSessionHandler(req, res, next) {
  try {
    res.json({
      item: startPanchkarmaSession(req.params.id, req.body, req.user.sub),
      message: "Panchkarma session started successfully."
    });
  } catch (error) {
    next(error);
  }
}

export function completePanchkarmaSessionHandler(req, res, next) {
  try {
    res.json({
      item: completePanchkarmaSession(req.params.id, req.body, req.user.sub),
      message: "Panchkarma session completed successfully."
    });
  } catch (error) {
    next(error);
  }
}
