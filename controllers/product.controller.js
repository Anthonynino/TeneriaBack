import { productsModel } from '../models/products.model.js'
import { inventoryMovementsModel } from '../models/inventoryMovements.model.js'
import { sequelize } from '../database/db.js'
import { Op } from 'sequelize'

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
  const transaction = await sequelize.transaction()
  try {
    const {
      name,
      quantity,
      code,
      ubication,
      size,
      categoryId,
      supplierId,
      userId,
    } = req.body

    // Validar que todos los campos requeridos estén presentes
    if (
      !name ||
      !quantity ||
      !code ||
      !ubication ||
      !categoryId ||
      !supplierId
    ) {
      return res
        .status(400)
        .json({ message: 'Todos los campos son requeridos' })
    }

    // Verificar si el nombre o código del producto ya existen
    const existingProductByName = await productsModel.findOne({
      where: { name },
    })
    if (existingProductByName) {
      return res
        .status(400)
        .json({ message: 'El nombre del producto ya está en uso' })
    }

    const existingProductByCode = await productsModel.findOne({
      where: { code },
    })
    if (existingProductByCode) {
      return res
        .status(400)
        .json({ message: 'El código del producto ya existe' })
    }

    // Crear el nuevo producto
    const newProduct = await productsModel.create(
      {
        name,
        quantity,
        code,
        ubication,
        size: size == null ? 'pequeño' : size,
        categoryId,
        supplierId,
      },
      { transaction }
    )

    // Registrar el movimiento de creación
    await inventoryMovementsModel.create(
      {
        productId: newProduct.id,
        quantity: +quantity,
        movementType: 'Nuevo',
        movementDate: new Date(),
        userId,
        departmentId: null,
      },
      { transaction }
    )

    // Confirmar la transacción
    await transaction.commit()

    // Enviar la respuesta con el nuevo producto creado
    res.json(newProduct)
  } catch (error) {
    // Revertir la transacción en caso de error
    await transaction.rollback()
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
        quantity: +Math.abs(quantity), //Asegurar que si me envian el valor de la cantidad en negativo poder revertirlo y colocarlo positivo
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

// Función para editar un producto
export const editProduct = async (req, res) => {
  const {
    productId,
    name,
    code,
    ubication,
    size = null,
    categoryId,
    supplierId,
  } = req.body

  try {
    // Encuentra el producto por ID
    const product = await productsModel.findByPk(productId)

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }

    // Validar si el nuevo nombre ya existe (excepto el producto actual)
    if (name && name !== product.name) {
      const existingProductByName = await productsModel.findOne({
        where: {
          name,
          categoryId,
          id: { [Op.ne]: productId }, // Excluir el producto actual
        },
      })

      if (existingProductByName) {
        return res
          .status(400)
          .json({ message: 'El nombre del producto ya está en uso' })
      }
    }

    // Validar si el nuevo código ya existe (excepto el producto actual)
    if (code && code !== product.code) {
      const existingProductByCode = await productsModel.findOne({
        where: {
          code,
          id: { [Op.ne]: productId }, // Excluir el producto actual
        },
      })

      if (existingProductByCode) {
        return res
          .status(400)
          .json({ message: 'El código del producto ya existe' })
      }
    }

    // Actualiza solo los campos proporcionados
    const updatedProduct = await product.update({
      name: name !== undefined ? name : product.name,
      code: code !== undefined ? code : product.code,
      ubication: ubication !== undefined ? ubication : product.ubication,
      size: size !== undefined ? size : product.size,
      categoryId: categoryId !== undefined ? categoryId : product.categoryId,
      supplierId: supplierId !== undefined ? supplierId : product.supplierId,
      date: product.date,
    })

    // Responde con el producto actualizado
    res.status(200).json(updatedProduct)
  } catch (error) {
    console.error('Error al editar el producto:', error)
    res.status(500).json({ message: 'Error al editar el producto', error })
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
