import { productsModel } from './products.model.js'
import { categoryModel } from './category.model.js'
import { rolModel } from './roles.model.js'
import { userModel } from './user.model.js'
import { inventoryMovementsModel } from './inventoryMovements.model.js'
import { suppliersModel } from './suppliers.model.js'
import { departmentsModel } from './departments.model.js'
import { reportModel } from './reports.model.js'
import { movementProductsModel } from './movement_products.js'

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

//Define las relaciones entre un movimiento de invetario y un departamento
inventoryMovementsModel.belongsTo(departmentsModel, {
  foreignKey: 'departmentId',
  as: 'movementDepartment',
})

departmentsModel.hasMany(inventoryMovementsModel, {
  foreignKey: 'departmentId',
  as: 'departmentInventory',
})

//Definir relaciones de un usuario con el reporte
reportModel.belongsTo(userModel, {
  foreignKey: 'userId',
  as: 'reportUser',
})

userModel.hasMany(reportModel, {
  foreignKey: 'userId',
  as: 'usersReports',
})

// Relacion entre el movimiento del inventario y el movimiento del producto
inventoryMovementsModel.hasMany(movementProductsModel, {
  foreignKey: 'movementId',
  as: 'inventoryMovementProduct',
})

movementProductsModel.belongsTo(inventoryMovementsModel, {
  foreignKey: 'movementId',
  as: 'movementProductInventory',
})

// Define la relación entre un Movimiento de Inventario y un Producto
movementProductsModel.belongsTo(productsModel, {
  foreignKey: 'productId',
  as: 'product',
})
productsModel.hasMany(movementProductsModel, {
  foreignKey: 'productId',
  as: 'productsMovements',
})
