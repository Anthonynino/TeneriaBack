import { sequelize } from '../database/db.js'
import { DataTypes } from 'sequelize'

export const movementProductsModel = sequelize.define(
    'movement_products',
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      movementId: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      productId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );
  