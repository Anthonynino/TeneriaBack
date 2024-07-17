import { sequelize } from '../database/db.js';
import { DataTypes } from 'sequelize';

export const productsModel = sequelize.define('products', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ubication: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  size: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  categoryId: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  supplierId: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  status: {
    type: DataTypes.BIGINT,
    defaultValue: 1,
  },
}, {
  timestamps: false,
});
