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

export const getOneSupplier = async (req, res) => {
  try {
    const { supplierId } = req.params
    console.log(supplierId)
    const supplier = await suppliersModel.findOne({
      where: {
        id: supplierId,
        status: 1,
      },
    })
    if (!supplier) {
      return res.status(404).json({ message: 'Proveedor no encontrado' })
    }

    res.json(supplier)
  } catch (error) {
    res.json({ message: error.message })
  }
}

// Función para crear un nuevo proveedor
export const createNewSupplier = async (req, res) => {
  try {
    const { companyName, RIF, location, IsInNationalTerritory } = req.body
    console.log("valores: " + companyName, RIF, location, IsInNationalTerritory)

    // Validar que todos los campos requeridos estén presentes
    if (
      !companyName ||
      !RIF ||
      !location 
    ) {
      return res
        .status(400)
        .json({ message: 'Todos los campos son requeridos' })
    }

    // Validar que no exista un proveedor con el mismo RIF
    const existingSupplierByRIF = await suppliersModel.findOne({
      where: { rif: RIF },
    })

    if (existingSupplierByRIF) {
      return res
        .status(400)
        .json({ message: 'Ya existe un proveedor con ese RIF' })
    }

    // Crear el nuevo proveedor
    const newSupplier = await suppliersModel.create({
      name: companyName,
      rif: RIF,
      location,
      IsInNationalTerritory,
    })

    // Enviar la respuesta con el nuevo proveedor creado
    res.json(newSupplier)
  } catch (error) {
    console.error('Error al crear el nuevo proveedor:', error)
    res.status(500).json({ message: 'Error al crear el nuevo proveedor' })
  }
}

// Función para editar un proveedor
export const editSupplier = async (req, res) => {
  const { supplierId, companyName, location, IsInNationalTerritory } = req.body;

  try {
    // Encuentra el proveedor por ID
    const supplier = await suppliersModel.findByPk(supplierId);

    if (!supplier) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }

    // Actualiza solo los campos proporcionados
    const updatedSupplier = await supplier.update({
      name: companyName !== undefined ? companyName : supplier.name,
      location: location !== undefined ? location : supplier.location,
      IsInNationalTerritory: IsInNationalTerritory !== undefined ? IsInNationalTerritory : supplier.IsInNationalTerritory,
    });

    // Responde con el proveedor actualizado
    res.status(200).json(updatedSupplier);
  } catch (error) {
    console.error('Error al editar el proveedor:', error);
    res.status(500).json({ message: 'Error al editar el proveedor', error });
  }
};