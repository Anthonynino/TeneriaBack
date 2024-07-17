import { userModel } from '../models/user.model.js'
import { productsModel } from '../models/products.model.js'
import { suppliersModel } from '../models/suppliers.model.js'

// Obtiene toda la cantidad de usuarios, productos y proveedores
export const getAllQuantities = async (req, res) => {
  try {
    const userQuantity = await userModel.count()
    const productQuantity = await productsModel.count()
    const supplierQuantity = await suppliersModel.count()

    res.status(200).json({ userQuantity, productQuantity, supplierQuantity })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al obtener las cantidades' })
  }
}
