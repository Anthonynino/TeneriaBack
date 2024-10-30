import { DataTypes } from 'sequelize';

export function movementProductsModel(sequelize) {
  return sequelize.define(
    'movement_products',
    {
      id: {
        type: DataTypes.INTEGER, // Cambiado a INTEGER para compatibilidad con SQLite
        autoIncrement: true,
        primaryKey: true,
      },
      movementId: {
        type: DataTypes.INTEGER, // Cambiado a INTEGER para compatibilidad
        allowNull: true,
      },
      productId: {
        type: DataTypes.INTEGER, // Cambiado a INTEGER para compatibilidad
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER, // Cambiado a INTEGER para compatibilidad
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );
}
