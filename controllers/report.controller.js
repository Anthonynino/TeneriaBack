import { inventoryMovementsModel } from '../models/inventoryMovements.model.js'
import { productsModel } from '../models/products.model.js'
import { departmentsModel } from '../models/departments.model.js'
import { movementProductsModel } from '../models/movement_products.js'
import { suppliersModel } from '../models/suppliers.model.js'
import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import { reportModel } from '../models/reports.model.js'
import { Sequelize } from 'sequelize'
import ExcelJS from 'exceljs'
import moment from 'moment'

// Función para obtener la ruta absoluta
const getDirName = () => {
  return path.resolve()
}

export const reportSuppliersExcel = async (req, res) => {
  try {
    const { usuarioId } = req.params

    // Obtener datos de proveedores activos
    const suppliers = await suppliersModel.findAll({
      attributes: ['name', 'rif', 'code', 'location'],
      where: { status: 1 },
    })

    // Crear un nuevo workbook y agregar una hoja
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Proveedores')

    // Agregar el logo de Tenería Rubio
    const logoPath = path.join(getDirName(), 'public', 'logo.png')
    const logoBuffer = fs.readFileSync(logoPath)
    const logoImage = workbook.addImage({
      buffer: logoBuffer,
      extension: 'png',
    })

    // Centrar el logo en las columnas A hasta C, ocupando la altura de las filas 1 a 6
    sheet.mergeCells('A1:C6') // Unir celdas de A1 a C6
    sheet.getCell('A1').value = '' // Limpiar la celda A1 para asegurar que el logo esté vacío

    // Agregar la imagen en el área unida
    sheet.addImage(logoImage, {
      tl: { col: 0, row: 0 }, // Top left (A1)
      ext: { width: 300, height: 120 }, // Ajusta el tamaño de la imagen
    })

    // Especificaciones de Tenería Rubio (colocadas debajo del logo)
    sheet.getCell('A7').value = 'Tenería Rubio CA'
    sheet.getCell('A8').value = 'Dirección: Avenida 1 Con Calle 10'
    sheet.getCell('A9').value = 'Tel: 027-67621555'
    sheet.getCell('A10').value = 'Correo: teneriaRubio@gmail.com'

    // Ajustar el formato de la información
    for (let i = 7; i <= 10; i++) {
      const cell = sheet.getCell(`A${i}`)
      cell.font = { name: 'Arial', size: 12 }
      cell.alignment = { horizontal: 'center' } // Alineación centrada
    }

    // Dejar un espacio entre la información de la empresa y la tabla
    sheet.getRow(11).height = 20 // Ajustar la altura de la fila 11 para dejar espacio

    // Definir los encabezados de los proveedores
    const headers = ['Nombre del proveedor', 'RIF', 'Codigo', 'Ubicación']
    sheet.addRow(headers) // Agregar encabezados directamente

    // Aplicar estilo a los encabezados
    headers.forEach((header, index) => {
      const cell = sheet.getCell(12, index + 1) // Cambiar a la fila 12 para los encabezados
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'D9D9D9' },
      }
      cell.font = { bold: true, name: 'Arial' }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }
      cell.alignment = { horizontal: 'center' } // Centrar encabezados
    })

    // Rellenar los datos de proveedores
    suppliers.forEach((supplier) => {
      sheet.addRow([
        supplier.name,
        supplier.rif,
        supplier.code,
        supplier.location,
      ])
    })

    // Ajustar el ancho de las columnas
    sheet.getColumn(1).width = 35 // Nombre del proveedor
    sheet.getColumn(2).width = 20 // RIF
    sheet.getColumn(3).width = 20 //Codigo
    sheet.getColumn(4).width = 40 // Ubicación

    // Generar la fecha actual para nombrar el archivo
    const currentDate = new Date()
    const formattedDate = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`

    // Ruta del archivo temporal
    const filePath = path.join(
      process.cwd(),
      `reporte_proveedores_${formattedDate}.xlsx`
    )

    // Escribir el archivo Excel en la ruta temporal
    await workbook.xlsx.writeFile(filePath)

    // Guardar un registro en la base de datos
    await reportModel.create({
      filePath: filePath,
      startDate: new Date(),
      endDate: new Date(),
      userId: usuarioId,
      status: 1,
    })

    // Configurar las cabeceras para la descarga
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=reporte_proveedores_${formattedDate}.xlsx`
    )
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )

    // Enviar el archivo como un stream
    const fileStream = fs.createReadStream(filePath)
    fileStream.pipe(res)

    // Manejar el fin del stream y eliminar el archivo temporal
    fileStream.on('close', () => {
      fs.unlinkSync(filePath) // Elimina el archivo después de enviar la respuesta
    })

    // Manejo de errores en la transmisión del archivo
    fileStream.on('error', (streamError) => {
      console.error('Error al enviar el archivo:', streamError)
      res.status(500).json({ message: 'Error al enviar el archivo' })
      fs.unlinkSync(filePath) // Elimina el archivo si ocurre un error
    })
  } catch (error) {
    console.error('Error al generar el reporte:', error)
    res.status(500).json({ message: 'Error al generar el reporte' })
  }
}

// Función para generar los reportes en PDF
export const reportSuppliersPDF = async (req, res) => {
  try {
    const { usuarioId } = req.params

    // Obtener los datos de la base de datos usando Sequelize
    const datos = await suppliersModel.findAll({
      attributes: ['name', 'rif', 'code', 'location'],
    })

    if (!datos || datos.length === 0) {
      throw new Error('No se encontraron datos en la base de datos.')
    }

    // Ruta temporal para guardar el archivo PDF
    const currentDate = new Date()
    const formattedDate = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
    const filePath = path.join(
      process.cwd(),
      `reporte_proveedores_${formattedDate}.pdf`
    )

    // Crear un nuevo documento PDF
    const doc = new PDFDocument({
      margin: 50,
    })

    // Guardar el archivo temporalmente en el sistema de archivos
    doc.pipe(fs.createWriteStream(filePath))

    // Función para truncar el texto si es demasiado largo
    const truncateText = (text, maxLength) => {
      return text.length > maxLength
        ? text.substring(0, maxLength) + '...'
        : text
    }

    // Ruta para el logo del pdf y el QR del footer
    const logoPath = path.join(process.cwd(), 'public', 'logo.png')
    const qrPath = path.join(process.cwd(), 'public', 'qr.png') // Ruta de la imagen del código QR

    // Agregar un título, encabezados y logo movido a la derecha
    const addHeaders = () => {
      doc.image(logoPath, 450, 20, { width: 80 }) // Logo movido a la derecha
      doc.fontSize(10).text('Tenería Rubio C.A', 50, 30, { align: 'left' }) // Título a la izquierda
      doc.fontSize(14).text('Reporte de Proveedores', { align: 'center' })

      doc.moveDown()
      doc
        .fontSize(8) // Reducir tamaño de la fuente para los encabezados
        .text('Nombre', 50, 100) // Columna 1
        .text('RIF', 200, 100) // Columna 2
        .text('Codigo', 350, 100) // Columna 3
        .text('Ubicación', 500, 100) // Columna 4
    }

    addHeaders()

    // Insertar los datos con coordenadas ajustadas
    let yPosition = 140 // Posición inicial en el eje Y
    const lineHeight = 35 // Mayor altura entre filas para más espacio
    const maxYPosition = doc.page.height - 100 // Ajustar límite para espacio de footer

    datos.forEach((item) => {
      // Verificar si estamos cerca del final de la página
      if (yPosition + lineHeight > maxYPosition) {
        addFooter(doc, qrPath) // Agregar footer antes de cambiar de página
        doc.addPage()
        yPosition = 140
        addHeaders() // Volver a agregar los encabezados
      }

      const truncatedName = truncateText(item.name, 25)
      const truncatedLocation = truncateText(item.location, 30) // Truncar ubicación

      // Insertar los datos con un tamaño de letra más pequeño
      doc
        .fontSize(8) // Reducir tamaño de la fuente para los datos
        .text(truncatedName, 50, yPosition, { width: 150 }) // Ajustar ancho de columna
        .text(item.rif, 200, yPosition, { width: 100 }) // Ajustar posición
        .text(item.code, 350, yPosition, { width: 100 })
        .text(truncatedLocation, 500, yPosition, { width: 100 })

      // Dibujar línea
      doc
        .moveTo(50, yPosition + 20)
        .lineTo(550, yPosition + 20)
        .stroke()

      yPosition += lineHeight
    })

    // Agregar footer en la última página
    addFooter(doc, qrPath)

    // Finalizar el PDF
    doc.end()

    // Guardar el registro en la base de datos
    await reportModel.create({
      filePath: filePath,
      startDate: new Date(),
      endDate: new Date(),
      userId: usuarioId,
      status: 1,
    })

    // Configurar la respuesta para descargar el archivo
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="reporte_proveedores_${formattedDate}.pdf"`
    )
    res.setHeader('Content-Type', 'application/pdf')

    // Enviar el archivo PDF como respuesta
    const fileStream = fs.createReadStream(filePath)
    fileStream.pipe(res)

    // Eliminar el archivo después de enviarlo
    fileStream.on('end', () => {
      fs.unlinkSync(filePath)
    })
  } catch (error) {
    console.error('Error generando el archivo PDF:', error.message)
    res.status(500).send(`Error generando el archivo PDF: ${error.message}`)
  }
}

// Función para agregar el footer con QR y datos de la empresa
const addFooter = (doc, qrPath) => {
  const footerY = doc.page.height - 80 // Ajustar posición del footer más arriba
  const qrSize = 40 // Reducir tamaño del QR para que todo quepa mejor

  // Dibujar línea superior del footer
  doc
    .moveTo(50, footerY - 10)
    .lineTo(550, footerY - 10)
    .stroke()

  // Insertar el QR a la izquierda
  doc.image(qrPath, 50, footerY, { width: qrSize })

  // Insertar los datos de la empresa con un tamaño de fuente más pequeño
  doc
    .fontSize(7) // Reducir tamaño de fuente
    .text('Tenería Rubio C.A.', 100, footerY)
    .text('Dirección: Avenida 1 Con Calle 10', 100, footerY + 7)
    .text('Teléfono: 027-67621555', 100, footerY + 14)
    .text('Correo: teneriaRubio@gmail.com', 100, footerY + 21)
}

//PRODUCTOS
export const reportProductExcel = async (req, res) => {
  try {
    const { usuarioId } = req.params
    const { startDate, endDate } = req.query

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: 'Debe proporcionar fechas de inicio y fin' })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Fechas inválidas' })
    }

    start.setDate(start.getDate() + 1) // Ajuste fechas
    end.setDate(end.getDate() + 1)
    start.setHours(0, 0, 0, 0)
    const endFormatted = `${end.getFullYear()}-${String(
      end.getMonth() + 1
    ).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')} 23:59:59`

    // Consultar movimientos de inventario y productos relacionados
    const movements = await inventoryMovementsModel.findAll({
      attributes: [
        'id',
        'movementType',
        'description',
        'movementDate',
        'recipientName',
      ],
      include: [
        {
          model: movementProductsModel,
          as: 'inventoryMovementProduct',
          include: [
            {
              model: productsModel,
              as: 'product',
              attributes: ['name'],
            },
          ],
        },
        {
          model: departmentsModel,
          as: 'movementDepartment',
          attributes: ['name'],
        },
      ],
      where: Sequelize.literal(
        `"movementDate" >= '${start.toISOString()}' AND "movementDate" <= '${endFormatted}'`
      ),
    })

    if (movements.length === 0) {
      return res.status(404).json({
        message:
          'No se encontraron registros en el rango de fechas seleccionado.',
      })
    }

    // Inicializar el workbook
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Reporte de Productos')

    // Agregar el logo de Tenería Rubio
    const logoPath = path.join(getDirName(), 'public', 'logo.png')
    const logoBuffer = fs.readFileSync(logoPath)

    // Agregar la imagen
    const logoImageId = workbook.addImage({
      buffer: logoBuffer,
      extension: 'png',
    })

    // Centrar el logo en las columnas A hasta C, ocupando la altura de las filas 1 a 6
    sheet.mergeCells('A1:C6') // Unir celdas de A1 a C6
    sheet.getCell('A1').value = '' // Limpiar la celda A1 para asegurar que el logo esté vacío

    // Agregar la imagen en el área unida
    sheet.addImage(logoImageId, {
      tl: { col: 0, row: 0 }, // Top left (A1)
      ext: { width: 300, height: 100 }, // Ajusta el tamaño de la imagen
    })

    // Especificaciones de Tenería Rubio (colocadas debajo del logo)
    sheet.getCell('A5').value = 'Tenería Rubio CA' // Cambié a A5
    sheet.getCell('A6').value = 'Dirección: Avenida 1 Con Calle 10' // Cambié a A6
    sheet.getCell('A7').value = 'Tel: 027-67621555' // Cambié a A7
    sheet.getCell('A8').value = 'Correo: teneriaRubio@gmail.com' // Cambié a A8

    const headerStyle = {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9D9D9' } },
      border: {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      },
      font: {
        name: 'Arial',
        bold: true,
      },
    }

    const headers = [
      'Tipo de Movimiento',
      'Fecha',
      'Responsable',
      'Productos Movidos',
      'Departamento Destino',
      'Descripción de Movimiento',
    ]

    headers.forEach((header, index) => {
      sheet.getCell(9, index + 1).value = header // Comenzar en la fila 9 para los encabezados
      sheet.getCell(9, index + 1).style = headerStyle
    })

    movements.forEach((item, rowIndex) => {
      const row = rowIndex + 10 // Comenzar a llenar datos desde la fila 10

      sheet.getCell(row, 1).value = item.movementType || 'Sin tipo'

      const formattedDate = new Date(item.movementDate).toLocaleDateString(
        'es-ES'
      )
      sheet.getCell(row, 2).value = formattedDate || 'Fecha no válida'

      sheet.getCell(row, 3).value = item.recipientName || 'Sin responsable'

      // Procesar lista de productos movidos
      const productsList =
        Array.isArray(item.inventoryMovementProduct) &&
        item.inventoryMovementProduct.length > 0
          ? item.inventoryMovementProduct
              .map((pm) => `${pm.product.name} (Cantidad: ${pm.quantity})`)
              .join(', ')
          : 'No hay productos'

      sheet.getCell(row, 4).value = productsList

      // Manejar el nombre del departamento
      const departmentName =
        item.movementType === 'Entrada'
          ? 'Almacén' // Nombre estático para entradas
          : item.movementDepartment
          ? item.movementDepartment.name
          : 'Sin departamento'

      sheet.getCell(row, 5).value = departmentName

      // Asegurarse de que 'item' esté definido antes de acceder a 'description'
      sheet.getCell(row, 6).value =
        item.description || 'Se han ingresado productos al inventario.'
    })

    // Ajustes de tamaño de columna
    sheet.getColumn(1).width = 20 // Tipo
    sheet.getColumn(2).width = 25 // Fecha
    sheet.getColumn(3).width = 25 // Responsable
    sheet.getColumn(4).width = 40 // Productos Movidos
    sheet.getColumn(5).width = 25 // Departamento
    sheet.getColumn(6).width = 60 // Descripción

    const currentDate = new Date()
    const formattedDate = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
    const filePath = path.join(
      process.cwd(),
      `reporte_productos_${formattedDate}.xlsx`
    )

    await workbook.xlsx.writeFile(filePath)

    await reportModel.create({
      filePath: filePath,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      userId: usuarioId,
      status: 1,
    })

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=reporte_productos_${formattedDate}.xlsx`
    )
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )

    const fileStream = fs.createReadStream(filePath)
    fileStream.pipe(res)

    fileStream.on('end', () => {
      fs.unlinkSync(filePath)
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al generar el reporte' })
  }
}

// PDF REPORTE PRODUCTOS
export const reportProductPDF = async (req, res) => {
  try {
    const { usuarioId } = req.params
    const { startDate, endDate } = req.query

    // Validar que las fechas de inicio y fin se proporcionen
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: 'Debe proporcionar fechas de inicio y fin' })
    }

    // Convertir las fechas de inicio y fin a objetos de fecha
    const start = moment(startDate, 'YYYY-MM-DD', true)
    const end = moment(endDate, 'YYYY-MM-DD', true)

    // Validar que las fechas sean válidas
    if (!start.isValid() || !end.isValid()) {
      return res.status(400).json({ message: 'Fechas inválidas' })
    }

    // Ajustar las fechas para incluir el final del día
    const adjustedStart = start.startOf('day').toISOString()
    const adjustedEnd = end.endOf('day').toISOString()

    // Consultar movimientos de inventario y productos relacionados
    const movements = await inventoryMovementsModel.findAll({
      attributes: [
        'id',
        'movementType',
        'description',
        'movementDate',
        'recipientName',
      ],
      include: [
        {
          model: movementProductsModel,
          as: 'inventoryMovementProduct',
          include: [
            {
              model: productsModel,
              as: 'product',
              attributes: ['name'],
            },
          ],
        },
        {
          model: departmentsModel,
          as: 'movementDepartment',
          attributes: ['name'],
        },
      ],
      where: {
        movementDate: {
          [Sequelize.Op.between]: [adjustedStart, adjustedEnd],
        },
      },
    })

    if (movements.length === 0) {
      return res.status(404).json({
        message:
          'No se encontraron registros en el rango de fechas seleccionado.',
      })
    }

    // Crear un nuevo documento PDF
    const doc = new PDFDocument({ margin: 20 }) // Reducir margen
    const logoPath = path.join(getDirName(), 'public', 'logo.png')
    const qrPath = path.join(getDirName(), 'public', 'qr.png') // Asegúrate de que la ruta del QR sea correcta

    // Configurar la respuesta para descargar el archivo
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="reporte_movimientos.pdf"'
    )
    res.setHeader('Content-Type', 'application/pdf')

    // Enviar el PDF como respuesta
    doc.pipe(res)

    // Añadir logo
    doc.image(logoPath, 50, 20, { width: 80 }) // Ajustar tamaño del logo
    doc.fontSize(12).text('Tenería Rubio C.A', 120, 30, { align: 'center' })

    // Agregar un título
    doc
      .fontSize(16)
      .text('Reporte de Movimientos de Inventario', { align: 'center' })

    // Definir los encabezados
    doc.moveDown()
    doc
      .fontSize(10) // Reducir tamaño de fuente
      .text('Tipo', 50, 100, { width: 60 }) // Ajustar ancho
      .text('Descripción', 110, 100, { width: 150 }) // Ajustar ancho
      .text('Fecha', 260, 100, { width: 60 }) // Ajustar ancho
      .text('Departamento', 320, 100, { width: 100 }) // Ajustar ancho
      .text('Nombre del Destinatario', 420, 100, { width: 100 }) // Ajustar ancho

    // Función para truncar el texto si supera una longitud
    const truncateText = (text, maxLength) => {
      return text.length > maxLength
        ? text.substring(0, maxLength) + '...'
        : text
    }

    // Insertar los datos
    let yPosition = 140
    const pageHeightLimit = doc.page.height - 50
    const lineHeight = 20 // Reducir altura de línea
    const maxYPosition = pageHeightLimit - 80 // Límite de posición Y para evitar el footer

    movements.forEach((item) => {
      if (yPosition + lineHeight > maxYPosition) {
        addFooter(doc, qrPath) // Agregar footer antes de cambiar de página
        doc.addPage()
        yPosition = 140
        doc
          .fontSize(10)
          .text('Tipo', 50, yPosition, { width: 60 })
          .text('Descripción', 110, yPosition, { width: 150 })
          .text('Fecha', 260, yPosition, { width: 60 })
          .text('Departamento', 320, yPosition, { width: 100 })
          .text('Nombre del Destinatario', 420, yPosition, { width: 100 })
        yPosition += 30
      }

      doc
        .text(truncateText(item.movementType, 20), 50, yPosition, {
          width: 60,
        })
        .text(truncateText(item.description, 30), 110, yPosition, {
          width: 150,
        })
        .text(
          new Date(item.movementDate).toLocaleDateString('es-ES'),
          260,
          yPosition,
          { width: 60 }
        )
        .text(
          item.movementDepartment?.name || 'Sin Departamento',
          320,
          yPosition,
          { width: 100 }
        )
        .text(item.recipientName || 'Sin Nombre', 420, yPosition, {
          width: 100,
        })

      // Separador entre filas - Ajustar longitud de la línea
      doc
        .moveTo(50, yPosition + lineHeight - 5)
        .lineTo(570, yPosition + lineHeight - 5)
        .stroke()
      yPosition += lineHeight
    })

    // Agregar el footer al final
    addFooter(doc, qrPath)

    // Finalizar el documento
    doc.end()

    // Guardar el registro en la tabla "reports"
    const filePath = path.join(
      getDirName(),
      'public',
      'reportes',
      `reporte_${Date.now()}.pdf`
    )
    await reportModel.create({
      filePath: filePath,
      startDate: start,
      endDate: end,
      userId: usuarioId,
      status: 1,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al generar el reporte' })
  }
}
