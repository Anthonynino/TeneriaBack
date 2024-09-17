import { Router } from "express";
import { authRequire } from "../middlewares/validate.Token.js";
import {
  reportSuppliersPDF,
  reportSuppliersExcel,
} from "../controllers/report.controller.js";

const router = Router();

router.get("/reportSupplierExcel", authRequire, reportSuppliersExcel);
router.get("/reportSupplierPDF", reportSuppliersPDF);

export default router;
