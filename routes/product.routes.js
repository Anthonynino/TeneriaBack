import { Router } from 'express'
import { authRequire } from '../middlewares/validate.Token.js'
import {
  getAllProducts,
  getProduct,
  createProduct,
  creteEntryProducts,
  createProductExit,
  editProduct,
  deleteProduct,
  generateInvoice,
} from '../controllers/product.controller.js'

const router = Router()

router.get('/products/:categoryId', authRequire, getAllProducts)
router.get('/product/:id', authRequire, getProduct)
router.post('/createProduct', authRequire, createProduct)
router.post('/creteEntryProducts', creteEntryProducts)
router.post('/createProductExit', createProductExit)
router.put('/editProduct', authRequire, editProduct)
router.delete('/deleteProduct/:id', authRequire, deleteProduct)
router.post('/generateInvoice', generateInvoice)
export default router
