import { sequelize } from "../database/db.js";
import { DataTypes } from "sequelize";

export const noteModel = sequelize.define("note", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    default: Date.now
  },
  userId: {
    type: DataTypes.BIGINT,
  }
});

