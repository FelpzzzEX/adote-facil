import { Request, Response } from 'express'
import {
  CreateAnimalService,
  createAnimalServiceInstance,
} from '../../services/animal/create-animal.js'

// Adicionado para substituir os "Números Mágicos"
enum HttpStatusCode {
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  INTERNAL_SERVER_ERROR = 500,
}

class CreateAnimalController {
  constructor(private readonly createAnimal: CreateAnimalService) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const { user } = request

    // REATORAÇÃO: Guard Clause para falhar rápido se não houver usuário.
    if (!user) {
      return response
        .status(HttpStatusCode.UNAUTHORIZED)
        .json({ error: 'Usuário não autenticado.' })
    }

    const { name, type, gender, race, description } = request.body
    const pictures = request.files as Express.Multer.File[]

    try {
      const pictureBuffers = pictures.map((file) => file.buffer)

      const result = await this.createAnimal.execute({
        name,
        type,
        gender,
        race,
        description,
        userId: user.id, // REATORAÇÃO: Acesso seguro, pois o `user` foi verificado.
        pictures: pictureBuffers,
      })

      // REATORAÇÃO: Uso do enum para maior clareza.
      const statusCode = result.isFailure()
        ? HttpStatusCode.BAD_REQUEST
        : HttpStatusCode.CREATED

      return response.status(statusCode).json(result.value)
    } catch (err) {
      const error = err as Error
      console.error('Error creating animal:', error)
      // REATORAÇÃO: Uso do enum para maior clareza.
      return response
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ error: error.message })
    }
  }
}

export const createAnimalControllerInstance = new CreateAnimalController(
  createAnimalServiceInstance,
)
