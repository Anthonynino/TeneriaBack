import { Router } from "express";
import {
  login,
  register,
  logout,
  profile,
  verifyToken,
  consultarUsuario,
} from "../controllers/auth.controller.js";
//importacion de la auntenticacion del token para poder ingresar a una página
import { authRequire } from "../middlewares/validate.Token.js";
import { validateSchema } from "../middlewares/validator.schemas.js"; //Primero se utuliza el middleware que utilizamos para validar
import { registerShema, loginSchema } from "../schemas/auth.schema.js"; //Segundo le pasamos como parametros los esquemas para validar los datos

const router = Router();

router.post("/register", validateSchema(registerShema), register);

router.post("/login", validateSchema(loginSchema), login);

router.post("/logout", logout);

router.post("/username", consultarUsuario);

router.get("/verify", verifyToken);

router.get("/profile", authRequire, profile);


export default router;
