import { Router } from 'express'
import { authRequire } from '../middlewares/validate.Token.js'
import {
  reportSuppliersPDF,
  reportSuppliersExcel,
  reportProductExcel,
  reportProductPDF,
} from '../controllers/report.controller.js'

const router = Router()

router.get('/reportSupplierExcel/:usuarioId', authRequire, reportSuppliersExcel)
router.get('/reportSupplierPDF/:usuarioId', authRequire, reportSuppliersPDF)
router.get('/reportProductExcel/:usuarioId', authRequire, reportProductExcel)
router.get('/reportProductPDF/:usuarioId', authRequire, reportProductPDF)

export default router
