import XlsxPopulate from "xlsx-populate"; //Importacion para usar la libreria que permite generar los reportes en excel
import { suppliersModel } from "../models/suppliers.model.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

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

    // Paso 6: Agregar un título
    doc.fontSize(18).text("Reporte de Proveedores", {
      align: "center",
    });

    // Paso 6: Definir los encabezados con coordenadas fijas para cada columna
    doc.moveDown();
    doc
      .fontSize(12)
      .text("Nombre", 50, 100) // Columna 1: Nombre
      .text("RIF", 200, 100) // Columna 2: RIF
      .text("Ubicación", 350, 100); // Columna 3: Ubicación

    // Paso 7: Insertar los datos con coordenadas fijas para cada columna
    let yPosition = 140; // Posición inicial en el eje Y
    datos.forEach((item) => {
      doc
        .text(item.name, 50, yPosition, { width: 100 }) // Columna 1
        .text(item.rif, 200, yPosition, { width: 100 }) // Columna 2
        .text(item.location, 350, yPosition, { width: 200 }); // Columna 3
      doc
        .moveTo(50, yPosition + 40) // Inicio de la línea (X, Y)
        .lineTo(550, yPosition + 40) // Final de la línea (X, Y)
        .stroke(); // Dibujar la línea

      yPosition += 60; // Moverse hacia abajo en cada iteración
    });

    // Paso 9: Finalizar el PDF
    doc.end();
  } catch (error) {
    console.error("Error generando el archivo PDF:", error.message);
    res.status(500).send(`Error generando el archivo PDF: ${error.message}`);
  }
};
