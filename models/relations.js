import { initializeModels } from './index.js'

export const defineRelations = (sequelize) => {
  const {
    Category,
    Role,
    User,
    Product,
    InventoryMovement,
    Supplier,
    Department,
    Report,
    MovementProduct,
  } = initializeModels(sequelize)

  // Define la relación entre un Usuario y un Rol
  User.belongsTo(Role, { foreignKey: 'rolId', as: 'rol' })
  Role.hasMany(User, { foreignKey: 'rolId', as: 'users' })

  // Define la relación entre un Producto y una Categoría
  Product.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'productCategory',
  })
  Category.hasMany(Product, {
    foreignKey: 'categoryId',
    as: 'categoryProducts',
  })

  // Define la relación entre un Movimiento de Inventario y un Usuario
  InventoryMovement.belongsTo(User, { foreignKey: 'userId', as: 'user' })
  User.hasMany(InventoryMovement, {
    foreignKey: 'userId',
    as: 'inventoryMovements',
  })

  // Define la relación entre un Producto y un Proveedor
  Product.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplierProduct' })
  Supplier.hasMany(Product, { foreignKey: 'supplierId', as: 'products' })

  // Define las relaciones entre un Movimiento de Inventario y un Departamento
  InventoryMovement.belongsTo(Department, {
    foreignKey: 'departmentId',
    as: 'movementDepartment',
  })
  Department.hasMany(InventoryMovement, {
    foreignKey: 'departmentId',
    as: 'departmentInventory',
  })

  // Definir relaciones de un Usuario con el Reporte
  Report.belongsTo(User, { foreignKey: 'userId', as: 'reportUser' })
  User.hasMany(Report, { foreignKey: 'userId', as: 'usersReports' })

  // Relación entre el Movimiento del Inventario y el Movimiento del Producto
  InventoryMovement.hasMany(MovementProduct, {
    foreignKey: 'movementId',
    as: 'inventoryMovementProduct',
  })
  MovementProduct.belongsTo(InventoryMovement, {
    foreignKey: 'movementId',
    as: 'movementProductInventory',
  })

  // Define la relación entre un Movimiento de Inventario y un Producto
  MovementProduct.belongsTo(Product, { foreignKey: 'productId', as: 'product' })
  Product.hasMany(MovementProduct, {
    foreignKey: 'productId',
    as: 'productsMovements',
  })
}
