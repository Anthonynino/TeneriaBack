import { sequelize } from '../database/db.js'
import { DataTypes } from 'sequelize'

export const userModel = sequelize.define('users', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rolId: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
})
