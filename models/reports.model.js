import { DataTypes } from 'sequelize';
import { Sequelize } from 'sequelize';

export function reportModel(sequelize) {
  return sequelize.define(
    'reports',
    {
      id: {
        type: DataTypes.INTEGER, // Cambiado a INTEGER para compatibilidad con SQLite
        primaryKey: true,
        autoIncrement: true,
      },
      filePath: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      generatedDate: {
        type: DataTypes.DATE, // DATE es compatible con SQLite
        allowNull: true,
        defaultValue: Sequelize.NOW,
      },
      startDate: {
        type: DataTypes.DATE, // DATE es compatible con SQLite
        allowNull: true,
      },
      endDate: {
        type: DataTypes.DATE, // DATE es compatible con SQLite
        allowNull: true,
      },
      userId: {
        type: DataTypes.INTEGER, // Cambiado a INTEGER para compatibilidad
        allowNull: true,
      },
      status: {
        type: DataTypes.INTEGER, // Cambiado a INTEGER para compatibilidad
        allowNull: false,
        defaultValue: 1,
      },
    },
    {
      timestamps: false,
    }
  );
}
