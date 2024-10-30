//importacion del jsonwebtoken, para las validaciones de paginas
import jwt from "jsonwebtoken";
import {TOKEN_SECRET} from '../config.js'

//Autenticación de las paginas
export function createAccessToken(payload) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,  // Pasar directamente el payload
      TOKEN_SECRET,
      {
        expiresIn: "31d",
      },
      (error, token) => {
        if (error) {
          return reject(error); // Retornar inmediatamente si hay un error
        }
        resolve(token);
      }
    );
  });
}

