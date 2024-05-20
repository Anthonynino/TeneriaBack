import { productsModel } from "../models/products.model.js"

//Obtener todas las tareas
export const getAllProducts = async (req, res) => {
  try {
    const products = await productsModel.findAll({
        where: { //Esto es una validación para que me traiga solo las tareas de mi usuario 
         userId: req.user.payload.id
        } 
    });
    res.json(products);
  } catch (error) {
    res.json({ message: err.message });
  }
};

//Crear una tarea
/* export const createProduct = async (req, res) => {
  try {
    const { title, description, date } = req.body;
    const tokenId = req.user.payload.id
    const newProduct = await productsModel.create({
      title,
      description,
      date,
      userId: tokenId
    });

    res.json(newProduct);
  } catch (error) {
    res.json({ message: error.message });
  }
}; */

//Obtener solo una tarea
/* export const getTask = async (req, res) => {
  try {
    const id = req.params.id;
    const task = await productsModel.findOne({
      where: {
        id,
      },
    });
    if (!task) {
      return res.status(404).json({message: 'Tarea no encontrada'});
    }

    res.json(task);
  } catch (error) {
    res.json({ message: error.message });
  }
};
 */
//Eliminar solo una tarea
/* export const deleteTask = async (req, res) => {
  try {
    const id = req.params.id;
    const task = await productsModel.destroy({
      where: {
        id,
      },
    });
    if (!task) {
      return res.status(404).json({message: 'Error no se encontro ninguna tarea'})
    }
    res.json({message: 'Tarea eliminada correctamente'});
  } catch (error) {
    res.json({ message: error.message });
  }
}; */

//Actualizar una tarea
/* export const updateTask = async (req, res) => {
  try {
    const id = req.params.id;
    const [updatedRows] = await productsModel.update(req.body, { //la función update devuelve un array
      where: {
        id,
      },
    });

    if (updatedRows === 0) { //Si updatedRows es igual a 0, significa que ninguna fila se actualizó como resultado de la operación.
      return res.status(404).json({ message: 'Error: no se encontró ninguna tarea' });
    }

    res.json({ message: "La tarea se actualizó correctamente" });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
 */