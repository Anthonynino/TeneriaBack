import XlsxPopulate from "xlsx-populate"; //Importacion para usar la libreria que permite generar los reportes en excel
import { inventoryMovementsModel } from "../models/inventoryMovements.model.js";
import { productsModel } from "../models/products.model.js";
import { departmentsModel } from "../models/departments.model.js";
import { suppliersModel } from "../models/suppliers.model.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

// Función para obtener la ruta absoluta
const getDirName = () => {
  return path.resolve();
};

export const reportSuppliersExcel = async (req, res) => {
  try {
    const suppliers = await suppliersModel.findAll({
      attributes: ["name", "rif", "location"],
      where: { status: 1 },
    });

    const workbook = await XlsxPopulate.fromBlankAsync();
    const sheet = workbook.sheet(0);

    const headers = ["Nombre del proveedor", "RIF", "Ubicacion"];
    headers.forEach((header, index) => {
      sheet.cell(1, index + 1).value(header);
    });

    suppliers.forEach((item, rowIndex) => {
      sheet.cell(rowIndex + 2, 1).value(item.name);
      sheet.cell(rowIndex + 2, 2).value(item.rif);
      sheet.cell(rowIndex + 2, 3).value(item.location);
    });

    // Guardar el archivo temporalmente
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
    const filePath = path.join(
      process.cwd(),
      `reporte_proveedores${formattedDate}.xlsx`
    ); // process.cwd() para la ruta actual
    await workbook.toFileAsync(filePath);

    // Configurar encabezados para la descarga
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=reporte_proveedores_${formattedDate}.xlsx`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    // Enviar el archivo como stream
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Eliminar el archivo después de enviarlo
    fileStream.on("end", () => {
      fs.unlinkSync(filePath); // Elimina el archivo después de enviarlo
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al generar el reporte" });
  }
};

//Funcion para generar los reportes en PDF
export const reportSuppliersPDF = async (req, res) => {
  try {
    // Paso 1: Obtener los datos de la base de datos usando Sequelize
    const datos = await suppliersModel.findAll({
      attributes: ["name", "rif", "location"],
    });

    // Paso 2: Verifica que haya datos disponibles
    if (!datos || datos.length === 0) {
      throw new Error("No se encontraron datos en la base de datos.");
    }

    // Paso 3: Configurar la respuesta para descargar el archivo
    res.setHeader("Content-Disposition", 'attachment; filename="reporte.pdf"');
    res.setHeader("Content-Type", "application/pdf");

    // Paso 4: Crear un nuevo documento PDF
    const doc = new PDFDocument();

    // Paso 5: Enviar el PDF como respuesta
    doc.pipe(res);

    // Función para truncar el nombre a 25 caracteres
    const truncateText = (text, maxLength) => {
      return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    };

    //Ruta para el logo del pdf
    const logoPath = path.join(getDirName(), 'public', 'logo.png');

    


    // Paso 6: Agregar un título y encabezados
    const addHeaders = () => {
      doc.image(logoPath, 50, 20, { width: 100 });
      doc.fontSize(14).text("Tenería Rubio C.A", 120, 30, { align: "center" });
      doc.fontSize(18).text("Reporte de Proveedores", { align: "center" });

      doc.moveDown();
      doc
        .fontSize(12)
        .text("Nombre", 50, 100) // Columna 1: Nombre
        .text("RIF", 250, 100) // Columna 2: RIF (más a la derecha)
        .text("Ubicación", 400, 100); // Columna 3: Ubicación (más a la derecha)
    };

    addHeaders();

    // Paso 7: Insertar los datos con coordenadas fijas para cada columna
    let yPosition = 140; // Posición inicial en el eje Y
    const lineHeight = 60; // Altura de cada fila
    const maxYPosition = doc.page.height - 50; // Límite inferior de la página

    datos.forEach((item, index) => {
      // Verificar si estamos cerca del final de la página
      if (yPosition + lineHeight > maxYPosition) {
        doc.addPage(); // Añadir una nueva página
        yPosition = 140; // Reiniciar la posición Y en la nueva página
        addHeaders(); // Volver a agregar los encabezados en la nueva página
      }

      // Truncar el nombre si tiene más de 25 caracteres
      const truncatedName = truncateText(item.name, 30);

      // Insertar los datos de cada proveedor
      doc
        .text(truncatedName, 50, yPosition, { width: 180 }) // Columna 1: Nombre (más espacio horizontal)
        .text(item.rif, 250, yPosition, { width: 100 }) // Columna 2: RIF
        .text(item.location, 400, yPosition, { width: 150 }); // Columna 3: Ubicación (movida a la derecha)

      // Dibujar una línea debajo de cada fila de datos
      doc
        .moveTo(50, yPosition + 40) // Inicio de la línea (X, Y)
        .lineTo(550, yPosition + 40) // Final de la línea (X, Y)
        .stroke(); // Dibujar la línea

      yPosition += lineHeight; // Moverse hacia abajo en cada iteración
    });

    // Paso 9: Finalizar el PDF
    doc.end();
  } catch (error) {
    console.error("Error generando el archivo PDF:", error.message);
    res.status(500).send(`Error generando el archivo PDF: ${error.message}`);
  }
};


//PRODUCTOS

// Asegúrate de tener acceso a los modelos
// Asegúrate de importar el modelo Product

export const reportProductExcel = async (req, res) => {
  try {
    const movements = await inventoryMovementsModel.findAll({
      attributes: ["quantity", "movementType", "movementDate"],
      include: [
        {
          model: productsModel,
          as: "product", // Especificar el alias correcto
          attributes: ["name"], // Solo traer el nombre del producto
        },
        {
          model: departmentsModel,
          as: "movementDepartment", // Alias para el modelo de departamentos
          attributes: ["name"], // Traer solo el nombre del departamento
        },
      ],
    });

    const workbook = await XlsxPopulate.fromBlankAsync();
    const sheet = workbook.sheet(0);

    const headers = [
      "Producto",
      "Cantidad",
      "Tipo de movimiento",
      "Fecha",
      "DepartamentoDestino",
    ];
    headers.forEach((header, index) => {
      sheet.cell(1, index + 1).value(header);
    });

    movements.forEach((item, rowIndex) => {
      console.log(item.Department); // Verifica si el objeto Department tiene datos
      sheet.cell(rowIndex + 2, 1).value(item.product.name);
      sheet.cell(rowIndex + 2, 2).value(item.quantity);
      sheet.cell(rowIndex + 2, 3).value(item.movementType);

      const formattedDate = new Date(item.movementDate).toLocaleDateString(
        "es-ES"
      );
      sheet.cell(rowIndex + 2, 4).value(formattedDate);

      const departmentName = item.movementDepartment
        ? item.movementDepartment.name
        : "Sin departamento";
      sheet.cell(rowIndex + 2, 5).value(departmentName);
    });

    // Guardar y enviar el archivo
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
    const filePath = path.join(
      process.cwd(),
      `reporte_productos${formattedDate}.xlsx`
    );
    await workbook.toFileAsync(filePath);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=reporte_productos_${formattedDate}.xlsx`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on("end", () => {
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al generar el reporte" });
  }
};

//PDF REPORTE PRODUCTOS

export const reportProductPDF = async (req, res) => {
  try {
    // Paso 1: Obtener los datos de la base de datos usando Sequelize
    const datos = await inventoryMovementsModel.findAll({
      attributes: ["quantity", "movementType", "movementDate"],
      include: [
        {
          model: productsModel,
          as: "product",
          attributes: ["name"], // Obtener el nombre del producto
        },
        {
          model: departmentsModel,
          as: "movementDepartment", // Alias del departamento
          attributes: ["name"], // Obtener el nombre del departamento
        },
      ],
    });

    // Paso 2: Verifica que haya datos disponibles
    if (!datos || datos.length === 0) {
      throw new Error("No se encontraron datos en la base de datos.");
    }

    // Paso 3: Configurar la respuesta para descargar el archivo
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="reporte_movimientos.pdf"'
    );
    res.setHeader("Content-Type", "application/pdf");

    // Paso 4: Crear un nuevo documento PDF
    const doc = new PDFDocument();

    // Paso 5: Enviar el PDF como respuesta
    doc.pipe(res);
    const logoPath = path.join(getDirName(), 'public', 'logo.png');

    // Añadir logo
    doc.image(logoPath, 50, 20, { width: 100 });
    doc.fontSize(14).text("Tenería Rubio C.A", 120, 30, { align: "center" });
    // Paso 6: Agregar un título
    doc.fontSize(18).text("Reporte de Movimientos de Inventario", {
      align: "center",
    });

    // Paso 7: Definir los encabezados con coordenadas fijas para cada columna
    doc.moveDown();
    doc
      .fontSize(12)
      .text("Producto", 50, 100) // Columna 1: Nombre del producto
      .text("Cantidad", 160, 100) // Columna 2: quantity
      .text("Tipo", 250, 100) // Columna 3: movementType
      .text("Fecha", 335, 100) // Columna 4: movementDate
      .text("Departamento", 450, 100); // Columna 5: Nombre del departamento

    // Función para truncar el texto si supera una longitud
    const truncateText = (text, maxLength) => {
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    // Paso 8: Insertar los datos con coordenadas fijas para cada columna
    let yPosition = 140; // Posición inicial en el eje Y
    const pageHeightLimit = doc.page.height - 50; // Límite para el alto de la página, restando un margen
    const lineHeight = 20; // Altura de cada línea de datos

    datos.forEach((item) => {
      // Verificar si se supera el límite de la página
      if (yPosition + lineHeight > pageHeightLimit) {
        doc.addPage(); // Añadir una nueva página
        yPosition = 100; // Reiniciar la posición Y en la nueva página

        // Repetir los encabezados en la nueva página
        doc
          .fontSize(12)
          .text("Producto", 50, yPosition)
          .text("Cantidad", 160, yPosition)
          .text("Tipo", 250, yPosition)
          .text("Fecha", 335, yPosition)
          .text("Departamento", 450, yPosition);

        yPosition += 40; // Ajustar la posición Y después de los encabezados
      }

      // Insertar los datos, truncando el nombre del producto si excede 24 caracteres
      doc
        .text(truncateText(item.product.name, 24), 50, yPosition, { width: 100 }) // Columna 1: Nombre del producto truncado
        .text(item.quantity, 180, yPosition, { width: 100 }) // Columna 2
        .text(item.movementType, 250, yPosition, { width: 100 }) // Columna 3

        // Formatear la fecha
        .text(
          new Date(item.movementDate).toLocaleDateString("es-ES"),
          335,
          yPosition,
          { width: 100 }
        ) // Columna 4

        // Verificación para manejar valores nulos en el nombre del departamento
        .text(
          item.movementDepartment?.name || "Sin Departamento",
          450, yPosition, { width: 100 }
        ); // Columna 5: Nombre del departamento o "Sin Departamento"

      // Dibujar una línea debajo de cada fila de datos
      doc
        .moveTo(50, yPosition + 30) // Inicio de la línea (X, Y)
        .lineTo(550, yPosition + 30) // Final de la línea (X, Y)
        .stroke(); // Dibujar la línea

      yPosition += 60; // Aumentar el espacio entre las filas
    });

    // Paso 9: Finalizar el documento
    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al generar el reporte" });
  }
};
