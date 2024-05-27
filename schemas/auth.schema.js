import { z } from 'zod' //El z significa que nos va a permitir asignar tipos de datos
export const registerShema = z.object({
  username: z.string({
    required_error: 'El usuario es requerido',
    message: 'El usuario es incorrecto',
  }),
  email: z.string({
      required_error: 'El correo es requerido',
    }).email({
      message: 'Formato del email invalido',
    }),

  password: z.string({
      required_error: 'La contraseña es requerida',
    }).min(6, {
      message: 'La contraseña debe tener al menos 6 caracteres',
    }),
  rolId: z.number({
    required_error: 'El rol es requerido',
    message: 'El rol es incorrecto',
  })
})

export const loginSchema = z.object({
  username: z.string({
      required_error: 'El usuario es requerido',
    }),
  password: z.string({
      required_error: 'La contraseña es requerida',
    }).min(6, {
      message: 'La contraseña debe tener al menos 6 caracteres',
    }),
})
