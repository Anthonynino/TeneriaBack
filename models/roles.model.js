import { DataTypes } from 'sequelize';

export function rolModel(sequelize) {
  return sequelize.define("roles", {
    id: {
      type: DataTypes.INTEGER, // Cambiado a INTEGER para compatibilidad con SQLite
      primaryKey: true,
      autoIncrement: true,
    },
    rol: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER, // Cambiado a INTEGER para compatibilidad
      defaultValue: 1,
    }
  },
  {
    timestamps: false,
  });
}
