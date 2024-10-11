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
    movementType: {
      type: DataTypes.ENUM('Entrada', 'Salida'),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true, // Para notas adicionales
    },
    receiptNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Asegura que cada recibo sea único
    },
    recipientName: {
      type: DataTypes.STRING,
      allowNull: true, // Nombre del destinatario
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
    departmentId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
)
