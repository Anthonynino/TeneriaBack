import { categoryModel } from './category.model.js'
import { rolModel } from './roles.model.js'
import { userModel } from './user.model.js'
import { productsModel } from './products.model.js'
import { inventoryMovementsModel } from './inventoryMovements.model.js'
import { suppliersModel } from './suppliers.model.js'
import { departmentsModel } from './departments.model.js'
import { reportModel } from './reports.model.js'
import { movementProductsModel } from './movement_products.js'

const initializeModels = (sequelize) => {
  const Category = categoryModel(sequelize)
  const Role = rolModel(sequelize)
  const User = userModel(sequelize)
  const Product = productsModel(sequelize)
  const InventoryMovement = inventoryMovementsModel(sequelize)
  const Supplier = suppliersModel(sequelize)
  const Department = departmentsModel(sequelize)
  const Report = reportModel(sequelize)
  const MovementProduct = movementProductsModel(sequelize)

  return { Category, Role, User, Product, InventoryMovement, Supplier, Department, Report, MovementProduct }
}

export { initializeModels }
