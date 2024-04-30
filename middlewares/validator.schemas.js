export const validateSchema = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body) //Esto es una funcion que trae los esquemas es decir cuando llegue aqui los esquemas la ejecutaran para validar
    next()
  } catch (error) {
    return res.status(400).json(error.errors.map(error => error.message)) //Se busca del error que me trae dos objetos se mapea y se busca solo el mensaje para que quede mas legible para el frontend
  }
}
