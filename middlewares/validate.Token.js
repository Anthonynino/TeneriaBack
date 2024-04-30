import jwt from 'jsonwebtoken'
import {TOKEN_SECRET} from '../config.js'

export const authRequire = (req, res, next) =>{
  const {token} = req.cookies

  if(!token){
    return res.status(401).json({message: 'Credenciales invalidas'})
  }

  jwt.verify(token, TOKEN_SECRET, (err, decoded) => {
    if(err){
      return res.status(403).json({message: 'Token no valido'})
    }
    
    req.user = decoded; //El req es algo que se puede pasar es decir como esto es un middleware entonces a la siguiente funcion que sigue ya deberia tener el usuario los datos del token guardado
    
    next()
  })
}