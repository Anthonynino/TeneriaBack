import { productsModel } from '../models/products.model.js'

//Obtener todos los productos
export const getAllProducts = async (req, res) => {
  try {
    const products = await productsModel.findAll({
      where: { status: 1 },
    })
    res.json(products)
  } catch (error) {
    res.json({ message: err.message })
  }
}

//Obtener solo un producto
export const getProduct = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id)
    const product = await productsModel.findOne({
      where: {
        id,
        status: 1
      },
    });
    if (!product) {
      return res.status(404).json({message: 'Producto no encontrado'});
    }

    res.json(product);
  } catch (error) {
    res.json({ message: error.message });
  }
};

//Crear un producto
export const createProduct = async (req, res) => {
  try {
    const { name, quantity, code, ubication, size, categoryId} = req.body;
    const newProduct = await productsModel.create({
      name,
      quantity,
      code,
      ubication,
      size,
      categoryId
    });

    res.json(newProduct);
  } catch (error) {
    res.json({ message: error.message });
  }
};

// Aumentar o disminuir el stock de un producto
export const updateStock = async (req, res) => {
  try {
    const id = req.params.id;
    const { quantity } = req.body;

    const product = await productsModel.findByPk(id);
    if (!product) {
      // Si el producto no se encuentra, devolver un error 404
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    let updatedProduct;

    if (quantity >= 0) {
      // Aumentar el stock si la cantidad es positiva
      updatedProduct = await product.increment('quantity', { by: quantity });
    } else {
      // Disminuir el stock si la cantidad es negativa
      // Verificar si hay suficiente stock disponible para disminuir
      if (product.quantity < Math.abs(quantity)) {
        return res.status(400).json({ message: 'No hay suficiente stock disponible' });
      }
      updatedProduct = await product.decrement('quantity', { by: Math.abs(quantity) });
    }
    
    // Devolver el producto actualizado en la respuesta
    res.json(updatedProduct);
  } catch (error) {
    // Si hay un error interno del servidor, devolver un error 500
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


