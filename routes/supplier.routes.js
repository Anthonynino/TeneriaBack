import { Router } from "express";
import { authRequire } from "../middlewares/validate.Token.js";
import { getAllSuppliers } from "../controllers/supplier.controller.js";

const router = Router();

router.get("/suppliers", authRequire, getAllSuppliers);

export default router;