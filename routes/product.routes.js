import { Router } from 'express'
import { authRequire } from '../middlewares/validate.Token.js'
import {
  getAllProducts,
  getProduct,
  createProduct,
  creteEntryProducts,
  editProduct,
  deleteProduct,
} from '../controllers/product.controller.js'

const router = Router()

router.get('/products/:categoryId', authRequire, getAllProducts)
router.get('/product/:id', authRequire, getProduct)
router.post('/createProduct', authRequire, createProduct)
router.post('/creteEntryProducts', creteEntryProducts)
router.put('/editProduct', authRequire, editProduct)
router.delete('/deleteProduct/:id', authRequire, deleteProduct)
export default router
