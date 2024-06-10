import { categoryModel } from "../models/category.model.js"

//Obtener todas las categorias
export const getAllCategories = async (req, res) => {
    try {
      const categories = await categoryModel.findAll({
        where: { status: 1 },
      })
      res.json(categories)
    } catch (error) {
      throw new Error(error)
    }
  }