import { productsModel } from '../models/products.model.js'
import { inventoryMovementsModel } from '../models/inventoryMovements.model.js'
import { sequelize } from '../database/db.js'

//Obtener todos los productos
export const getAllProducts = async (req, res) => {
  const { categoryId } = req.params // Obtener el parámetro de ruta categoryId
  try {
    const products = await productsModel.findAll({
      where: { categoryId, status: 1 },
      order: [['id', 'ASC']],
    })
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar los productos', error })
  }
}

//Obtener solo un producto
export const getProduct = async (req, res) => {
  try {
    const id = req.params.id
    const product = await productsModel.findOne({
      where: {
        id,
        status: 1,
      },
    })
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }

    res.json(product)
  } catch (error) {
    res.json({ message: error.message })
  }
}

// Crear un producto
export const createProduct = async (req, res) => {
  try {
    const { name, quantity, code, ubication, size, categoryId, supplierId } =
      req.body

    // Validar que todos los campos requeridos estén presentes
    if (
      !name ||
      !quantity ||
      !code ||
      !ubication ||
      !size ||
      !categoryId ||
      !supplierId
    ) {
      return res
        .status(400)
        .json({ message: 'Todos los campos son requeridos' })
    }

    // Crear el nuevo producto
    const newProduct = await productsModel.create({
      name,
      quantity,
      code,
      ubication,
      size,
      categoryId,
      supplierId,
    })

    // Enviar la respuesta con el nuevo producto creado
    res.json(newProduct)
  } catch (error) {
    // Manejo de errores
    res.status(500).json({ message: error.message })
  }
}

// Aumentar o disminuir el stock de un producto
export const updateStock = async (req, res) => {
  const transaction = await sequelize.transaction()
  try {
    const { productId, quantity, userId, departmentId, movementType } = req.body

    // Verificar si la cantidad es válida
    if (quantity === 0) {
      return res
        .status(400)
        .json({ message: 'La cantidad debe ser diferente de cero' })
    }

    // Buscar el producto
    const product = await productsModel.findByPk(productId, { transaction })
    if (!product) {
      // Si el producto no se encuentra, devolver un error 404
      await transaction.rollback()
      return res.status(404).json({ message: 'Producto no encontrado' })
    }

    // Actualizar el stock
    if (quantity > 0) {
      // Aumentar el stock si la cantidad es positiva
      await product.increment('quantity', { by: quantity, transaction })
    } else {
      // Disminuir el stock si la cantidad es negativa
      if (product.quantity < Math.abs(quantity)) {
        await transaction.rollback()
        return res
          .status(400)
          .json({ message: 'No hay suficiente stock disponible' })
      }
      await product.decrement('quantity', {
        by: Math.abs(quantity),
        transaction,
      })
    }

    // Registrar el movimiento de inventario
    await inventoryMovementsModel.create(
      {
        productId,
        quantity,
        movementType,
        movementDate: new Date(),
        userId,
        departmentId,
      },
      { transaction }
    )

    // Confirmar la transacción
    await transaction.commit()

    // Devolver la respuesta exitosa
    res.json({
      message: 'Stock actualizado y movimiento registrado exitosamente',
    })
  } catch (error) {
    // Revertir la transacción en caso de error
    await transaction.rollback()
    // Si hay un error interno del servidor, devolver un error 500
    res.status(500).json({ message: 'Error interno del servidor', error })
  }
}

export const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id

    // Encuentra el producto por su ID
    const product = await productsModel.findByPk(id)

    // Si no se encuentra el producto, retorna un error 404
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }

    // Si la cantidad es mayor que 0, lanza un error
    if (product.quantity > 0) {
      return res
        .status(400)
        .json({ message: 'El producto tiene stock y no se puede eliminar' })
    }

    // Si la cantidad es 0, elimina el producto de manera logica
    await productsModel.update(
      { status: 0 },
      {
        where: { id },
      }
    )

    return res.status(200).json({ message: 'Producto eliminado con éxito' })
  } catch (error) {
    console.error('Error:', error)
    return res
      .status(500)
      .json({ message: 'Error al intentar eliminar el producto' })
  }
}
