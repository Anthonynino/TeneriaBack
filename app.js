import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser"; //este modulo nos ayuda a leer las cookies
import cors from "cors"; //Utilizamos este modulo para poder configurar los cors, porque como nuestos servidores son distintos y no son el mismo dominio entoces estan chocando
import { sequelize } from "./database/db.js";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/categories.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import supplierRoutes from "./routes/supplier.routes.js";
import deparmentsRoutes from "./routes/departments.routes.js";
import reportRoutes from "./routes/report.routes.js";
import "./models/relations.js"; //Relaciones de los modelos

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// Rutas de las peticiones
app.use("/api", authRoutes);
app.use("/api", productRoutes);
app.use("/api", categoryRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", supplierRoutes);
app.use("/api", deparmentsRoutes);
app.use("/api", reportRoutes);

async function main() {
  try {
    await sequelize.sync({ force: false });
    app.listen(8000);
    console.log("El servidor se esta ejecutando http://localhost:8000/");
  } catch (error) {
    console.error("Inestable la conexion del servidor:", error);
  }
}
main();
