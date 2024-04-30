import Sequelize from 'sequelize' 

export const sequelize = new Sequelize(
  'loginBiblia', // db name,
  'postgres', // username
  'leo2005', // password
  {
    host: 'localhost',
    dialect: 'postgres',
  }
)