import { Router } from 'express'
import { authRequire } from '../middlewares/validate.Token.js'
import {
  getAllSuppliers,
  createNewSupplier,
  getOneSupplier,
  editSupplier,
} from '../controllers/supplier.controller.js'

const router = Router()

router.get('/suppliers', authRequire, getAllSuppliers)
router.get('/supplier/:supplierId', authRequire, getOneSupplier)
router.post('/createSupplier', authRequire, createNewSupplier)
router.put('/editSupplier', authRequire, editSupplier)

export default router
