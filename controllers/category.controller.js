import { models } from '../database/db.js';

//Obtener todas las categorias
export const getAllCategories = async (req, res) => {
    try {
      const categories = await models.Category.findAll({
        where: { status: 1 },
      })
      res.json(categories)
    } catch (error) {
      throw new Error(error)
    }
  }