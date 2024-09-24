import { Router } from 'express'
import { authRequire } from '../middlewares/validate.Token.js'
import {
  getAllSuppliers,
  createNewSupplier,
  getOneSupplier,
} from '../controllers/supplier.controller.js'

const router = Router()

router.get('/suppliers', authRequire, getAllSuppliers)
router.post('/supplier', authRequire, getOneSupplier)
router.get('/createSupplier', authRequire, createNewSupplier)

export default router
