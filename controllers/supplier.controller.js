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

export const createNewSupplier = async (req, res) => {
  try {
    const { companyName, RIF, location, IsInNationalTerritory } = req.body

    // Validar que todos los campos requeridos estén presentes
    if (
      !companyName ||
      !RIF ||
      !location ||
      IsInNationalTerritory === undefined
    ) {
      return res
        .status(400)
        .json({ message: 'Todos los campos son requeridos' })
    }

    const newSupplier = await suppliersModel.create({
      name: companyName,
      rif: RIF,
      location,
      IsInNationalTerritory,
    })
    res.json(newSupplier)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al crear el nuevo proveedor' })
  }
}
