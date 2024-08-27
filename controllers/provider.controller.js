import { suppliersModel } from "../models/suppliers.model.js";

//Obtener todas las categorias
export const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await suppliersModel.findAll({
      where: { status: 1 },
    });
    res.json(suppliers);
  } catch (error) {
    throw new Error(error);
  }
};
