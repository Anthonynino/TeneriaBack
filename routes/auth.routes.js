import { Router } from "express";
import {
  login,
  register,
  logout,
  verifyToken,
} from "../controllers/auth.controller.js";
import { validateSchema } from "../middlewares/validator.schemas.js"; //Primero se utuliza el middleware que utilizamos para validar
import { registerShema, loginSchema } from "../schemas/auth.schema.js"; //Segundo le pasamos como parametros los esquemas para validar los datos

const router = Router();

router.post("/register", validateSchema(registerShema), register);
router.post("/login", validateSchema(loginSchema), login);
router.post("/logout", logout);
router.get("/verify", verifyToken);


export default router;
