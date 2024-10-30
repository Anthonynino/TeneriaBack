import { DataTypes } from 'sequelize';

export function inventoryMovementsModel(sequelize) {
  return sequelize.define(
    'inventory_movements',
    {
      id: {
        type: DataTypes.INTEGER,
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
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      departmentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );
}
