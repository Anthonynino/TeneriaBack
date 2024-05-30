import { sequelize } from "../database/db.js";
import { DataTypes } from "sequelize";

export const rolModel = sequelize.define("roles", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  rol: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status:{
    type: DataTypes.BIGINT,
    defaultValue: 1,
  }
},
{
  timestamps: false,
});
