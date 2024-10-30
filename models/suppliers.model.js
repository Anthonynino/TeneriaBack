import { DataTypes } from 'sequelize';

export function suppliersModel(sequelize) {
  return sequelize.define(
    'supplier',
    {
      id: {
        type: DataTypes.INTEGER, // Cambiado a INTEGER para compatibilidad con SQLite
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      rif: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      IsInNationalTerritory: {
        type: DataTypes.BOOLEAN, // BOOLEAN es compatible con SQLite
        allowNull: true,
      },
      status: {
        type: DataTypes.INTEGER, // Cambiado a INTEGER para compatibilidad
        defaultValue: 1,
      },
    },
    {
      timestamps: false,
    }
  );
}
