import { sequelize } from '../database/db.js'
import { DataTypes } from 'sequelize'

export const inventoryMovementsModel = sequelize.define(
  'inventory_movements',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    movementType: {
      type: DataTypes.ENUM('Entrada', 'Salida'),
      allowNull: false,
    },
    movementDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
)
