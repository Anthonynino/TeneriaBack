import { Sequelize } from 'sequelize';
import { initializeModels } from '../models/index.js';
import { defineRelations } from '../models/relations.js'; // Importar la función de relaciones
import { fileURLToPath } from 'url';
import path from 'path';

// Obtener la ruta del archivo actual y el directorio
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Definir la ruta a la base de datos SQLite
const dbPath = path.join(__dirname, 'storage', 'teneria_db.sqlite');

// Configurar la instancia de Sequelize
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false, // Cambia a true si quieres ver los logs de las consultas
});

// Inicializar los modelos
const models = initializeModels(sequelize);

// Definir las relaciones entre los modelos
defineRelations(sequelize); // Llamada para establecer relaciones después de inicializar los modelos

// Sincronizar los modelos en la base de datos SQLite
(async () => {
  try {
    await sequelize.sync(); // 'force: true' eliminará tablas existentes
    console.log('Base de datos SQLite sincronizada correctamente.');
  } catch (error) {
    console.error('Error al sincronizar la base de datos:', error);
  }
})();

export { sequelize, models };
