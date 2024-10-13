import { productsModel } from '../models/products.model.js'
import { inventoryMovementsModel } from '../models/inventoryMovements.model.js'
import { movementProductsModel } from '../models/movement_products.js'
import { suppliersModel } from '../models/suppliers.model.js'
import { sequelize } from '../database/db.js'
import { Op } from 'sequelize'
import PDFDocument from 'pdfkit'
import path from 'path'
import fs from 'fs'

// Función para obtener la ruta absoluta
const getDirName = () => {
  return path.resolve()
}

//Obtener todos los productos
export const getAllProducts = async (req, res) => {
  const { categoryId } = req.params // Obtener el parámetro de ruta categoryId
  try {
    const products = await productsModel.findAll({
      where: { categoryId, status: 1 },
      order: [['code', 'ASC']],
      include: [
        {
          model: suppliersModel,
          as: 'supplier',
          attributes: ['name'],
        },
      ],
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
    const { name, code, ubication, specifications, categoryId, supplierId } =
      req.body

    // Validar que todos los campos requeridos estén presentes
    if (!name || !code || !ubication || !categoryId || !supplierId) {
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
        quantity: 0,
        code,
        ubication,
        specifications: specifications == null ? '' : specifications,
        categoryId,
        supplierId,
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
/* export const generateEntryOrExit = async (req, res) => {
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
} */

// Ingresar las entradas del producto
export const creteEntryProducts = async (req, res) => {
  const transaction = await sequelize.transaction()
  try {
    const { arrayProducts, userId, recipientName } = req.body

    // Generar un número de recibo único de 6 dígitos
    const receiptNumber = await generateReceiptNumber()

    // Preparar el registro en inventoryMovements
    const inventoryMovementData = {
      movementType: 'Entrada',
      description: '',
      receiptNumber,
      recipientName,
      movementDate: new Date(),
      userId,
      departmentId: null, // Dejar vacío ya que es una entrada
    }

    // Crear el movimiento de inventario
    const movement = await inventoryMovementsModel.create(
      inventoryMovementData,
      { transaction }
    )

    // Validar y agregar productos a la tabla movement_products
    for (const product of arrayProducts) {
      const { id: productId, quantity } = product

      // Convertir la cantidad a número
      const parsedQuantity = Number(quantity)

      // Verificar si la cantidad es válida
      if (parsedQuantity <= 0) {
        await transaction.rollback()
        return res.status(400).json({
          message: 'La cantidad de cada producto debe ser mayor que cero',
        })
      }

      // Buscar el producto en la base de datos
      const existingProduct = await productsModel.findByPk(productId, {
        transaction,
      })
      if (!existingProduct) {
        await transaction.rollback()
        return res
          .status(404)
          .json({ message: `Producto con ID ${productId} no encontrado` })
      }

      // Registrar el movimiento del producto en la nueva tabla
      await movementProductsModel.create(
        {
          movementId: movement.id, // Usar el ID del movimiento creado
          productId,
          quantity: parsedQuantity, // Guardar la cantidad como número
        },
        { transaction }
      )

      // Actualizar el stock en la tabla de productos
      await existingProduct.increment('quantity', {
        by: parsedQuantity,
        transaction,
      })
    }

    // Si todo va bien, confirmar la transacción
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

// Servicio para registrar salidas de productos
export const createProductExit = async (req, res) => {
  const transaction = await sequelize.transaction()
  try {
    const { arrayProducts, userId, departmentId, description, recipientName } = req.body

    // Generar un número de recibo único de 6 dígitos
    const receiptNumber = await generateReceiptNumber()

    // Preparar el registro en inventoryMovements
    const inventoryMovementData = {
      movementType: 'Salida',
      description: description || '', // Descripción opcional
      receiptNumber,
      recipientName, // Ahora registramos a quien se entregó la mercancía
      movementDate: new Date(),
      userId,
      departmentId, // Ahora es obligatorio en una salida
    }

    // Crear el movimiento de inventario
    const movement = await inventoryMovementsModel.create(
      inventoryMovementData,
      { transaction }
    )

    // Validar y reducir productos en la tabla movement_products
    for (const product of arrayProducts) {
      const { id: productId, quantity } = product

      // Convertir la cantidad a número
      const parsedQuantity = Number(quantity)

      // Verificar si la cantidad es válida
      if (parsedQuantity <= 0) {
        await transaction.rollback()
        return res.status(400).json({
          message: 'La cantidad de cada producto debe ser mayor que cero',
        })
      }

      // Buscar el producto en la base de datos
      const existingProduct = await productsModel.findByPk(productId, {
        transaction,
      })
      if (!existingProduct) {
        await transaction.rollback()
        return res
          .status(404)
          .json({ message: `Producto con ID ${productId} no encontrado` })
      }

      // Verificar si hay suficiente stock disponible
      if (existingProduct.quantity < parsedQuantity) {
        await transaction.rollback()
        return res.status(400).json({
          message: `Stock insuficiente para el producto: ${existingProduct.name}`,
        })
      }

      // Registrar el movimiento del producto en la tabla movement_products
      await movementProductsModel.create(
        {
          movementId: movement.id,
          productId,
          quantity: parsedQuantity,
        },
        { transaction }
      )

      // Actualizar el stock en la tabla de productos (restar la cantidad)
      await existingProduct.decrement('quantity', {
        by: parsedQuantity,
        transaction,
      })
    }

    // Confirmar la transacción si todo va bien
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

// Función para generar la factura y enviarla como respuesta
export const generateInvoice = async (req, res) => {
  const { items, recipientName } = req.body

  const doc = new PDFDocument({ size: 'LETTER', margin: 50 })

  const formattedDate = new Date().toLocaleDateString().replace(/\//g, '-')
  const fileName = `factura_${formattedDate}.pdf`
  const filePath = path.join(getDirName(), 'public', 'facturas', fileName)

  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const writeStream = fs.createWriteStream(filePath)
  doc.pipe(writeStream)

  const logoPath = path.join(getDirName(), 'public', 'logo.png')

  doc.image(logoPath, 450, 10, { width: 100 })
  doc
    .fontSize(20)
    .text('TENERIA RUBIO', { align: 'center', baseline: 'middle' })

  const today = new Date().toLocaleDateString()
  doc.fontSize(12).text(`Fecha: ${today}`, 50, 50)

  const tableTop = 100 // Ajusta la posición superior de la tabla
  const itemHeight = 25 // Altura de cada fila
  const rowSpacing = 5 // Espacio adicional entre filas
  const headerColor = '#791021' // Vinotinto

  // Encabezado de la tabla
  doc.rect(50, tableTop, 500, itemHeight).fill(headerColor)
  doc
    .fillColor('white')
    .fontSize(12)
    .text('Cantidad', 100, tableTop + 5, { width: 100, align: 'center' })
    .text('Producto', 300, tableTop + 5, { width: 200, align: 'center' })

  // Línea debajo del encabezado
  doc
    .moveTo(50, tableTop + itemHeight)
    .lineTo(550, tableTop + itemHeight)
    .stroke()

  // Inicializar la posición 'y' para los productos
  let y = tableTop + itemHeight + rowSpacing

  // Agregar productos a la tabla
  items.forEach((product, index) => {
    // Añadir el texto centrado en la fila
    doc
      .fillColor('black') // Asegurarse de que el texto sea negro
      .fontSize(12)
      .text(product.quantity, 100, y + (itemHeight - 12) / 2, {
        width: 100,
        align: 'center',
      }) // Cantidad centrada
      .text(product.name, 300, y + (itemHeight - 12) / 2, {
        width: 200,
        align: 'center',
      }) // Nombre del producto centrado

    // Dibujar línea horizontal para la fila (excluyendo la primera)
    if (index > 0) {
      doc.moveTo(50, y).lineTo(550, y).stroke() // Línea superior de la fila
    }

    y += itemHeight + rowSpacing // Mover hacia abajo para la siguiente fila
  })

  // Dibujar línea divisoria entre "Cantidad" y "Producto"
  doc
    .moveTo(250, tableTop)
    .lineTo(250, y) // La altura ahora es la posición 'y' que se incrementó
    .stroke() // Dibujar la línea vertical

  // Dibujar líneas de cierre de la tabla
  doc
    .moveTo(50, tableTop) // Línea izquierda
    .lineTo(50, y) // Lado izquierdo
    .lineTo(550, y) // Lado derecho
    .lineTo(550, tableTop) // Línea superior
    .lineTo(50, tableTop) // Regresar al punto inicial
    .stroke() // Dibujar el contorno completo de la tabla

  // Estilo para el título
  doc
    .fontSize(14)
    .fillColor('#791021')
    .text('Responsable de la Transacción:', 50, y + 20, {
      align: 'left',
    })

  // Resaltar el nombre del responsable
  doc
    .fontSize(16)
    .fillColor('black')
    .text(recipientName, 50, y + 40, {
      align: 'left',
    })

  // Añadir línea divisoria para mejorar el diseño
  doc
    .moveTo(50, y + 60)
    .lineTo(550, y + 60)
    .stroke()

  // Pie de página con la dirección
  doc
    .fontSize(10)
    .text('Dirección: Avenida 1 Con Calle 10', 50, y + 90)
    .text('Tel: 027-67621555', 50, y + 105)
    .text('Correo: teneriaRubio@gmail.com', 50, y + 120)

  const qrPath = path.join(getDirName(), 'public', 'qr.png')
  if (fs.existsSync(qrPath)) {
    doc.image(qrPath, 450, y + 80, { width: 70 })
  }

  doc.end()

  writeStream.on('finish', () => {
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.setHeader('Content-Type', 'application/pdf')

    const fileStream = fs.createReadStream(filePath)
    fileStream.pipe(res)

    fileStream.on('end', () => {
      fs.unlinkSync(filePath) // Eliminar el archivo temporal después de enviarlo
    })
  })
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

// Función encargada de eliminar un producto
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

// Función para generar un número de recibo aleatorio de 6 caracteres (alfanumérico)
const generateReceiptNumber = async () => {
  let receiptNumber

  const generateRandomString = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' // Letras y números
    let result = ''
    for (let i = 0; i < 6; i++) {
      // 6 caracteres en total
      const randomIndex = Math.floor(Math.random() * characters.length)
      result += characters[randomIndex]
    }
    return result
  }

  while (true) {
    // Generar una cadena aleatoria de 6 caracteres
    receiptNumber = generateRandomString()

    // Verificar si el número de recibo ya existe en la base de datos
    const existingReceipt = await inventoryMovementsModel.findOne({
      where: { receiptNumber },
    })

    // Si el número no existe, salir del bucle
    if (!existingReceipt) {
      break // Salir del bucle si el recibo no existe
    }
  }

  return receiptNumber
}
