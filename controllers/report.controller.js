import XlsxPopulate from 'xlsx-populate' //Importacion para usar la libreria que permite generar los reportes en excel
import { inventoryMovementsModel } from '../models/inventoryMovements.model.js'
import { productsModel } from '../models/products.model.js'
import { departmentsModel } from '../models/departments.model.js'
import { suppliersModel } from '../models/suppliers.model.js'
import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import { reportModel } from '../models/reports.model.js'
import { Sequelize } from 'sequelize'

// Función para obtener la ruta absoluta
const getDirName = () => {
  return path.resolve()
}

export const reportSuppliersExcel = async (req, res) => {
  try {
    const { usuarioId } = req.params

    // Obtener datos de proveedores activos
    const suppliers = await suppliersModel.findAll({
      attributes: ['name', 'rif', 'location'],
      where: { status: 1 },
    })

    // Crear el archivo Excel desde cero
    const workbook = await XlsxPopulate.fromBlankAsync()
    const sheet = workbook.sheet(0)

    // Definir los encabezados
    const headers = ['Nombre del proveedor', 'RIF', 'Ubicación']
    headers.forEach((header, index) => {
      sheet.cell(1, index + 1).value(header)
    })

    // Estilos para el encabezado
    const headerStyle = {
      fill: { type: 'solid', color: { rgb: 'D9D9D9' } },
      border: {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      },
      fontFamily: 'Arial',
      bold: true,
    }

    headers.forEach((header, index) => {
      sheet.cell(1, index + 1).style(headerStyle)
    })

    // Rellenar los datos de proveedores
    suppliers.forEach((supplier, rowIndex) => {
      sheet.cell(rowIndex + 2, 1).value(supplier.name)
      sheet.cell(rowIndex + 2, 2).value(supplier.rif)
      sheet.cell(rowIndex + 2, 3).value(supplier.location)
    })

    // Ajustar el ancho de las columnas
    sheet.column(1).width(35) // Columna A: 'Nombre del proveedor'
    sheet.column(2).width(20) // Columna B: 'RIF'
    sheet.column(3).width(30) // Columna C: 'Ubicación'

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

    // Guardar el archivo temporalmente
    await workbook.toFileAsync(filePath)

    // Guardar un registro en la base de datos
    await reportModel.create({
      filePath: filePath,
      startDate: new Date(), // Cambiar según sea necesario
      endDate: new Date(), // Cambiar según sea necesario
      userId: usuarioId,
      status: 1, // Estado del reporte (puede ser cambiado)
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

    // Paso 1: Obtener los datos de la base de datos usando Sequelize
    const datos = await suppliersModel.findAll({
      attributes: ['name', 'rif', 'location'],
    })

    // Paso 2: Verifica que haya datos disponibles
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

    // Paso 3: Crear un nuevo documento PDF
    const doc = new PDFDocument()

    // Paso 4: Guardar el archivo temporalmente en el sistema de archivos
    doc.pipe(fs.createWriteStream(filePath))

    // Función para truncar el nombre a 25 caracteres
    const truncateText = (text, maxLength) => {
      return text.length > maxLength
        ? text.substring(0, maxLength) + '...'
        : text
    }

    // Ruta para el logo del pdf
    const logoPath = path.join(process.cwd(), 'public', 'logo.png')

    // Paso 5: Agregar un título y encabezados
    const addHeaders = () => {
      doc.image(logoPath, 50, 20, { width: 100 })
      doc.fontSize(14).text('Tenería Rubio C.A', 120, 30, { align: 'center' })
      doc.fontSize(18).text('Reporte de Proveedores', { align: 'center' })

      doc.moveDown()
      doc
        .fontSize(12)
        .text('Nombre', 50, 100) // Columna 1: Nombre
        .text('RIF', 250, 100) // Columna 2: RIF (más a la derecha)
        .text('Ubicación', 400, 100) // Columna 3: Ubicación (más a la derecha)
    }

    addHeaders()

    // Paso 6: Insertar los datos con coordenadas fijas para cada columna
    let yPosition = 140 // Posición inicial en el eje Y
    const lineHeight = 60 // Altura de cada fila
    const maxYPosition = doc.page.height - 50 // Límite inferior de la página

    datos.forEach((item, index) => {
      // Verificar si estamos cerca del final de la página
      if (yPosition + lineHeight > maxYPosition) {
        doc.addPage() // Añadir una nueva página
        yPosition = 140 // Reiniciar la posición Y en la nueva página
        addHeaders() // Volver a agregar los encabezados en la nueva página
      }

      // Truncar el nombre si tiene más de 25 caracteres
      const truncatedName = truncateText(item.name, 30)

      // Insertar los datos de cada proveedor
      doc
        .text(truncatedName, 50, yPosition, { width: 180 }) // Columna 1: Nombre (más espacio horizontal)
        .text(item.rif, 250, yPosition, { width: 100 }) // Columna 2: RIF
        .text(item.location, 400, yPosition, { width: 150 }) // Columna 3: Ubicación (movida a la derecha)

      // Dibujar una línea debajo de cada fila de datos
      doc
        .moveTo(50, yPosition + 40) // Inicio de la línea (X, Y)
        .lineTo(550, yPosition + 40) // Final de la línea (X, Y)
        .stroke() // Dibujar la línea

      yPosition += lineHeight // Moverse hacia abajo en cada iteración
    })

    // Paso 7: Finalizar el PDF
    doc.end()

    // Paso 8: Guardar el registro en la base de datos (tabla reports)
    await reportModel.create({
      filePath: filePath,
      startDate: new Date(), // Puedes ajustar las fechas según tu lógica
      endDate: new Date(),
      userId: usuarioId,
      status: 1, // Estado por defecto
    })

    // Paso 9: Configurar la respuesta para descargar el archivo
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="reporte_proveedores_${formattedDate}.pdf"`
    )
    res.setHeader('Content-Type', 'application/pdf')

    // Paso 10: Enviar el archivo PDF como respuesta
    const fileStream = fs.createReadStream(filePath)
    fileStream.pipe(res)

    // Eliminar el archivo después de enviarlo
    fileStream.on('end', () => {
      fs.unlinkSync(filePath) // Elimina el archivo después de enviarlo
    })
  } catch (error) {
    console.error('Error generando el archivo PDF:', error.message)
    res.status(500).send(`Error generando el archivo PDF: ${error.message}`)
  }
}

//PRODUCTOS

// Asegúrate de tener acceso a los modelos
// Asegúrate de importar el modelo Product

export const reportProductExcel = async (req, res) => {
  try {
    const { usuarioId } = req.params
    const { startDate, endDate } = req.query

    // Validar que las fechas existan y sean válidas
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: 'Debe proporcionar fechas de inicio y fin' })
    }

    // Convertir las fechas a objetos Date en JavaScript
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Verificar que las fechas se hayan convertido correctamente
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Fechas inválidas' })
    }

    // Sumar 1 día a cada fecha
    start.setDate(start.getDate() + 1) // Aumenta 1 día a la fecha de inicio
    end.setDate(end.getDate() + 1) // Aumenta 1 día a la fecha de fin

    // Ajustar a 0 horas para el inicio
    start.setHours(0, 0, 0, 0) // Desde el comienzo del día

    // Cambiar el fin a las 23:59:59 en el formato deseado
    const endFormatted = `${end.getFullYear()}-${String(
      end.getMonth() + 1
    ).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')} 23:59:59`

    // Buscar movimientos de inventario dentro del rango de fechas
    const movements = await inventoryMovementsModel.findAll({
      attributes: ['quantity', 'movementType', 'movementDate'],
      include: [
        {
          model: productsModel,
          as: 'product', // Especificar el alias correcto
          attributes: ['name'], // Solo traer el nombre del producto
        },
        {
          model: departmentsModel,
          as: 'movementDepartment', // Alias para el modelo de departamentos
          attributes: ['name'], // Traer solo el nombre del departamento
        },
      ],
      where: Sequelize.literal(
        `"movementDate" >= '${start.toISOString()}' AND "movementDate" <= '${endFormatted}'`
      ),
    })

    // Verificar si hay registros
    if (movements.length === 0) {
      return res.status(404).json({
        message:
          'No se encontraron registros en el rango de fechas seleccionado.',
      })
    }

    const workbook = await XlsxPopulate.fromBlankAsync()
    const sheet = workbook.sheet(0)

    // Estilos para el encabezado
    const headerStyle = {
      fill: { type: 'solid', color: { rgb: 'D9D9D9' } },
      border: {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      },
      fontFamily: 'Arial',
      bold: true,
    }

    const headers = [
      'Producto',
      'Cantidad',
      'Tipo de movimiento',
      'Fecha',
      'DepartamentoDestino',
    ]

    headers.forEach((header, index) => {
      sheet
        .cell(1, index + 1)
        .value(header)
        .style(headerStyle)
    })

    movements.forEach((item, rowIndex) => {
      sheet.cell(rowIndex + 2, 1).value(item.product.name || 'Sin nombre')
      sheet.cell(rowIndex + 2, 2).value(item.quantity || 0)
      sheet.cell(rowIndex + 2, 3).value(item.movementType || 'Sin tipo')

      const formattedDate = new Date(item.movementDate).toLocaleDateString(
        'es-ES'
      )
      sheet.cell(rowIndex + 2, 4).value(formattedDate || 'Fecha no válida')

      const departmentName = item.movementDepartment
        ? item.movementDepartment.name
        : 'Sin departamento'
      sheet.cell(rowIndex + 2, 5).value(departmentName)
    })

    sheet.column(1).width(30) // Columna A para 'Producto'
    sheet.column(2).width(15) // Columna B para 'Cantidad'
    sheet.column(3).width(25) // Columna C para 'Tipo de movimiento'
    sheet.column(4).width(15) // Columna D para 'Fecha'
    sheet.column(5).width(25) // Columna E para 'DepartamentoDestino'

    const currentDate = new Date()
    const formattedDate = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
    const filePath = path.join(
      process.cwd(),
      `reporte_productos_${formattedDate}.xlsx`
    )
    await workbook.toFileAsync(filePath)

    // Guardar registro en la base de datos (tabla reports)
    await reportModel.create({
      filePath: filePath,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      userId: usuarioId,
      status: 1, // Estado por defecto, podrías modificarlo según tu lógica
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

//PDF REPORTE PRODUCTOS
export const reportProductPDF = async (req, res) => {
  try {
    const { usuarioId } = req.params
    const { startDate, endDate } = req.query

    // Validar que las fechas existan y sean válidas
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: 'Debe proporcionar fechas de inicio y fin' })
    }

    // Convertir las fechas a objetos Date en JavaScript
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Verificar que las fechas se hayan convertido correctamente
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Fechas inválidas' })
    }

    // Sumar 1 día a cada fecha
    start.setDate(start.getDate() + 1) // Aumenta 1 día a la fecha de inicio
    end.setDate(end.getDate() + 1) // Aumenta 1 día a la fecha de fin

    // Ajustar a 0 horas para el inicio
    start.setHours(0, 0, 0, 0) // Desde el comienzo del día

    // Cambiar el fin a las 23:59:59 en el formato deseado
    const endFormatted = `${end.getFullYear()}-${String(
      end.getMonth() + 1
    ).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')} 23:59:59`

    // Paso 1: Obtener los datos de la base de datos usando Sequelize
    const datos = await inventoryMovementsModel.findAll({
      attributes: ['quantity', 'movementType', 'movementDate'],
      include: [
        {
          model: productsModel,
          as: 'product',
          attributes: ['name'], // Obtener el nombre del producto
        },
        {
          model: departmentsModel,
          as: 'movementDepartment', // Alias del departamento
          attributes: ['name'], // Obtener el nombre del departamento
        },
      ],
      where: Sequelize.literal(
        `"movementDate" >= '${start.toISOString()}' AND "movementDate" <= '${endFormatted}'`
      ),
    })

    // Paso 2: Verifica que haya datos disponibles
    if (!datos || datos.length === 0) {
      throw new Error('No se encontraron datos en la base de datos.')
    }

    // Paso 3: Configurar la respuesta para descargar el archivo
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="reporte_movimientos.pdf"'
    )
    res.setHeader('Content-Type', 'application/pdf')

    // Paso 4: Crear un nuevo documento PDF
    const doc = new PDFDocument()

    // Paso 5: Enviar el PDF como respuesta
    doc.pipe(res)
    const logoPath = path.join(getDirName(), 'public', 'logo.png')

    // Añadir logo
    doc.image(logoPath, 50, 20, { width: 100 })
    doc.fontSize(14).text('Tenería Rubio C.A', 120, 30, { align: 'center' })

    // Paso 6: Agregar un título
    doc
      .fontSize(18)
      .text('Reporte de Movimientos de Inventario', { align: 'center' })

    // Paso 7: Definir los encabezados con coordenadas fijas para cada columna
    doc.moveDown()
    doc
      .fontSize(12)
      .text('Producto', 50, 100)
      .text('Cantidad', 160, 100)
      .text('Tipo', 250, 100)
      .text('Fecha', 335, 100)
      .text('Departamento', 450, 100)

    // Función para truncar el texto si supera una longitud
    const truncateText = (text, maxLength) => {
      return text.length > maxLength
        ? text.substring(0, maxLength) + '...'
        : text
    }

    // Paso 8: Insertar los datos
    let yPosition = 140
    const pageHeightLimit = doc.page.height - 50
    const lineHeight = 20

    datos.forEach((item) => {
      if (yPosition + lineHeight > pageHeightLimit) {
        doc.addPage()
        yPosition = 100
        doc
          .fontSize(12)
          .text('Producto', 50, yPosition)
          .text('Cantidad', 160, yPosition)
          .text('Tipo', 250, yPosition)
          .text('Fecha', 335, yPosition)
          .text('Departamento', 450, yPosition)
        yPosition += 40
      }

      doc
        .text(truncateText(item.product.name, 24), 50, yPosition, {
          width: 100,
        })
        .text(item.quantity, 180, yPosition, { width: 100 })
        .text(item.movementType, 250, yPosition, { width: 100 })
        .text(
          new Date(item.movementDate).toLocaleDateString('es-ES'),
          335,
          yPosition,
          { width: 100 }
        )
        .text(
          item.movementDepartment?.name || 'Sin Departamento',
          450,
          yPosition,
          { width: 100 }
        )

      doc
        .moveTo(50, yPosition + 30)
        .lineTo(550, yPosition + 30)
        .stroke()
      yPosition += 60
    })

    // Paso 9: Finalizar el documento
    doc.end()

    // Definir el filePath del reporte (ajusta según la lógica de tu aplicación)
    const filePath = path.join(
      getDirName(),
      'public',
      'reportes',
      `reporte_${Date.now()}.pdf`
    )

    // Paso 10: Guardar el registro en la tabla "reports"
    await reportModel.create({
      filePath: filePath, // Ruta del archivo PDF guardado
      startDate: new Date(), // Fecha de creación del reporte
      endDate: new Date(), // Fecha final del reporte (puedes ajustarla según sea necesario)
      userId: usuarioId, // ID del usuario que genera el reporte
      status: 1, // Estado inicial del reporte
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al generar el reporte' })
  }
}
