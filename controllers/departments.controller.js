import { models } from '../database/db.js';
//Obtener todos los departamentos
export const getAllDepartments = async (req, res) => {
    try {
      const departments = await models.Department.findAll({
        where: { status: 1 },
        attributes: ['id', 'name'],
      })
      res.json(departments)
    } catch (error) {
      res.status(500).json({ message: 'Error al buscar los productos', error })
    }
  }
