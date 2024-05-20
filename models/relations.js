import { productsModel } from './products.model.js'
import { categoryModel } from './category.model.js'
import { rolModel } from './roles.model.js'
import { userModel } from './user.model.js'

// Define la relación entre un producto y su rol
userModel.belongsTo(rolModel, {
  foreignKey: 'rolId',
  as: 'rol',
})
rolModel.hasMany(userModel, {
  foreignKey: 'rolId',
  as: 'users',
})

// Define la relación entre el un producto y una categoria
productsModel.belongsTo(categoryModel, {
  foreignKey: 'caregoryId',
  as: 'productCategory',
})

categoryModel.hasMany(productsModel, {
  foreignKey: 'caregoryId',
  as: 'categoryPro',
})
