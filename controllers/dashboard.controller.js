import { productsModel } from '../models/products.model.js'
import { suppliersModel } from '../models/suppliers.model.js'
import { reportModel } from '../models/reports.model.js'

// Obtiene toda la cantidad de usuarios, productos y proveedores
export const getAllQuantities = async (req, res) => {
  try {
    const reportQuantity = await reportModel.count({
      where: {
        status: 1,
      },
    })
    const productQuantity = await productsModel.count({
      where: {
        status: 1,
      },
    })
    const supplierQuantity = await suppliersModel.count({
      where: {
        status: 1,
      },
    })

    res.status(200).json({ reportQuantity, productQuantity, supplierQuantity })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al obtener las cantidades' })
  }
}
