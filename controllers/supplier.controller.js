import { suppliersModel } from '../models/suppliers.model.js'

// Obtiene todos los proveedores
export const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await suppliersModel.findAll({
      where: { status: 1 },
    })
    res.json(suppliers)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al obtener todos los proveedores' })
  }
}
