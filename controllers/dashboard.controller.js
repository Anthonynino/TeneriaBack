import { models } from '../database/db.js';

// Obtiene toda la cantidad de usuarios, productos y proveedores
export const getAllQuantities = async (req, res) => {
  try {
    const reportQuantity = await models.Report.count({
      where: {
        status: 1,
      },
    })
    const productQuantity = await models.Product.count({
      where: {
        status: 1,
      },
    })
    const supplierQuantity = await models.Supplier.count({
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
