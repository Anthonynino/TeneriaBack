import { sequelize } from '../database/db.js'
import { DataTypes } from 'sequelize'

export const departmentsModel = sequelize.define(
  'departments',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    status:{
        type: DataTypes.BIGINT,
        defaultValue: 1,
      }
  },
  {
    timestamps: false,
  }
)
