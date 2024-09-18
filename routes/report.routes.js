import { Router } from "express";
import { authRequire } from "../middlewares/validate.Token.js";
import {
  reportSuppliersPDF,
  reportSuppliersExcel,
  reportProductExcel,
  reportProductPDF,
} from "../controllers/report.controller.js";

const router = Router();

router.get("/reportSupplierExcel", authRequire, reportSuppliersExcel);
router.get("/reportSupplierPDF", authRequire, reportSuppliersPDF);

router.get("/reportProductExcel", authRequire, reportProductExcel);
router.get("/reportProductPDF", authRequire, reportProductPDF);

export default router;
