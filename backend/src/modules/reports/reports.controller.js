import {
  getDailyOpdReport,
  getIpdCensusReport,
  getLabWorkloadReport,
  getPharmacySalesReport,
  getPanchkarmaStatsReport,
  getReportsOverview,
  getRevenueReport
} from "./reports.service.js";

export function reportsOverviewHandler(req, res, next) {
  try {
    res.json(getReportsOverview(req.query));
  } catch (error) {
    next(error);
  }
}

export function dailyOpdReportHandler(req, res, next) {
  try {
    res.json(getDailyOpdReport(req.query));
  } catch (error) {
    next(error);
  }
}

export function ipdCensusReportHandler(req, res, next) {
  try {
    res.json(getIpdCensusReport(req.query));
  } catch (error) {
    next(error);
  }
}

export function revenueReportHandler(req, res, next) {
  try {
    res.json(getRevenueReport(req.query));
  } catch (error) {
    next(error);
  }
}

export function pharmacySalesReportHandler(req, res, next) {
  try {
    res.json(getPharmacySalesReport(req.query));
  } catch (error) {
    next(error);
  }
}

export function labWorkloadReportHandler(req, res, next) {
  try {
    res.json(getLabWorkloadReport(req.query));
  } catch (error) {
    next(error);
  }
}

export function panchkarmaStatsReportHandler(req, res, next) {
  try {
    res.json(getPanchkarmaStatsReport(req.query));
  } catch (error) {
    next(error);
  }
}
