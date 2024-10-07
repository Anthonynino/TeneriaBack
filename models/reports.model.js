import { sequelize } from '../database/db.js'
import { DataTypes } from 'sequelize'
import { Sequelize} from 'sequelize'

export const reportModel = sequelize.define(
  'reports',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    generatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.NOW,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    status: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    timestamps: false,
  }
)
