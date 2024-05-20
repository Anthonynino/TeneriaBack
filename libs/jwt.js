//importacion del jsonwebtoken, para las validaciones de paginas
import jwt from "jsonwebtoken";
import {TOKEN_SECRET} from '../config.js'

//Autenticación de las paginas
export function createAccessToken(payload) {
  return new Promise((resolve, reject) => {
    jwt.sign(
        {
            payload,
        },
        TOKEN_SECRET,
        {
          expiresIn: "30d",
        },
        (error, token) => {
          if (error){
            reject(error)
          }
          resolve(token)
        }
      );
  })
}
