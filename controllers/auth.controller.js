//Se importa el esquema que estamos usando de los usuarios
import { models } from '../database/db.js';

//importacion para encriptar la contraseña
import bcrypt from "bcryptjs";

//importacion de la biblioteca con el token
import { createAccessToken } from "../libs/jwt.js";
//Importamos la biblioteca jsonwebtoken para verificar el token
import jwt from "jsonwebtoken";
//Y nos traemos la llave que almacenamos en config
import { TOKEN_SECRET } from "../config.js";

//Registra un nuevo usuario.
export const register = async (req, res) => {
  const { username, password, rolId } = req.body;

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await models.User.create({
      username,
      password: passwordHash,
      rolId,
    });

    // Crear el token
    const token = await createAccessToken({ id: newUser.id });

    // Configurar la cookie
    res.cookie("token", token, { httpOnly: true });

    // Respuesta al usuario con todos los datos
    res.json(newUser);
  } catch (error) {
    console.error("Error al registrar el usuario:", error); // Loguear el error para depuración
    res.status(500).json({ message: "No se pudo registrar, revisa el nombre del usuario" });
  }
};

//Maneja las solicitudes de inicio de sesión de usuarios.
export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const userFound = await models.User.findOne({
      where: {
        username,
      },
    });

    const isMatch = await bcrypt.compare(password, userFound.password);

    if (!isMatch) {
      return res.status(400).json(["Contraseña incorrecta"]);
    }

    const token = await createAccessToken({ id: userFound.id });

    res.cookie("token", token);

    res.json(userFound);
  } catch (error) {
    res
      .status(404)
      .json(["Usuario o contraseña incorrectas, intentalo de nuevo"]);
  }
};

//Cerrar el token para poder salir de la pagina perfil despues de registrarse
export const logout = async (req, res) => {
  res.cookie("token", "", {
    expires: new Date(0),
  });
  return res.sendStatus(200);
};

//Verificacion del token para poder usarlo en solo las paginas necesarias
export const verifyToken = async (req, res) => {
  const { token } = req.cookies;
  
  if (!token) {
    return res.status(401).json({ message: "No autorizado" });
  }

  jwt.verify(token, TOKEN_SECRET, async (error, user) => {
    console.log(error)
    if (error) {
      return res.status(401).json({ message: "No autorizado" });
    }
    const userFound = models.User.findByPk(user.id);
    if (!userFound) {
      return res.status(401).json({ message: "No autorizado" });
    }
    return res.json(userFound);
  });
};
