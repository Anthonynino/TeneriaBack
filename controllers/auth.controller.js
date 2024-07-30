//Se importa el esquema que estamos usando de los usuarios
import { userModel } from "../models/user.model.js";

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
  console.log(username, password, rolId)
  try {
    //Encriptacion de la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
      username,
      password: passwordHash,
      rolId
    });

    //Aqui lo que hacemos es pasarle el parametro que vamos a usar para indentificar el token, que es el id
    const token = await createAccessToken({ id: newUser.id });

    res.cookie("token", token);

    //Respuesta al usuario con todos los datos
    res.json(newUser);
  } catch (error) {
    res
      .status(500)
      .json(["No se pudo registrar, revisa el correo o el nombre del usuario"]);
  }
};

//Maneja las solicitudes de inicio de sesión de usuarios.
export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const userFound = await userModel.findOne({
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
    const userFound = userModel.findByPk(user.id);
    if (!userFound) {
      return res.status(401).json({ message: "No autorizado" });
    }
    return res.json(userFound);
  });
};
