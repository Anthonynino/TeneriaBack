import { productsModel } from './products.model.js'
import { categoryModel } from './category.model.js'
import { rolModel } from './roles.model.js'
import { userModel } from './user.model.js'
import { inventoryMovementsModel } from './inventoryMovements.model.js'
import { suppliersModel } from './suppliers.model.js'

// Define la relación entre un Usuario y un Rol
userModel.belongsTo(rolModel, {
  foreignKey: 'rolId',
  as: 'rol',
})
rolModel.hasMany(userModel, {
  foreignKey: 'rolId',
  as: 'users',
})

// Define la relación entre un Producto y una Categoría
productsModel.belongsTo(categoryModel, {
  foreignKey: 'categoryId',
  as: 'productCategory',
})
categoryModel.hasMany(productsModel, {
  foreignKey: 'categoryId',
  as: 'categoryProducts',
})

// Define la relación entre un Movimiento de Inventario y un Producto
inventoryMovementsModel.belongsTo(productsModel, {
  foreignKey: 'productId',
  as: 'product',
})
productsModel.hasMany(inventoryMovementsModel, {
  foreignKey: 'productId',
  as: 'inventoryMovements',
})

// Define la relación entre un Movimiento de Inventario y un Usuario
inventoryMovementsModel.belongsTo(userModel, {
  foreignKey: 'userId',
  as: 'user',
})

userModel.hasMany(inventoryMovementsModel, {
  foreignKey: 'userId',
  as: 'inventoryMovements',
})

// Define la relación entre un Producto y un Proveedor
productsModel.belongsTo(suppliersModel, {
  foreignKey: 'supplierId',
  as: 'supplier',
})

suppliersModel.hasMany(productsModel, {
  foreignKey: 'supplierId',
  as: 'products',
})
