import { DataTypes } from 'sequelize';

export function productsModel(sequelize) {
  return sequelize.define('products', {
    id: {
      type: DataTypes.INTEGER, // Cambiado a INTEGER para compatibilidad con SQLite
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER, // Cambiado a INTEGER para compatibilidad
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
    specifications: {
      type: DataTypes.TEXT, // Cambiado a TEXT, que es más compatible con SQLite
      allowNull: true,
    },
    categoryId: {
      type: DataTypes.INTEGER, // Cambiado a INTEGER para compatibilidad
      allowNull: false,
    },
    supplierId: {
      type: DataTypes.INTEGER, // Cambiado a INTEGER para compatibilidad
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE, // DATE es compatible con SQLite
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.INTEGER, // Cambiado a INTEGER para compatibilidad
      defaultValue: 1,
    },
  }, {
    timestamps: false,
  });
}
