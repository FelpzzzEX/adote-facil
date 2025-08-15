# Detecção de Code Smells e Refatorações

## 1. Código Duplicado (Duplicated Code)

### Trecho do Código Original

**Arquivo:** `backend/src/repositories/chat.ts`

```typescript
// Método getChatsAndLastMessageByUserId
// ...
      include: {
        messages: { /* ... */ },
        user1: { select: { id: true, name: true } },
        user2: { select: { id: true, name: true } },
      },
// ...

// Método getChatWithMessagesByUserAndChatId
// ...
      include: {
        messages: { /* ... */ },
        user1: { select: { id: true, name: true } },
        user2: { select: { id: true, name: true } },
      },
// ...
````

### Smell Identificado

O objeto `{ select: { id: true, name: true } }` é repetido quatro vezes no mesmo arquivo para selecionar os campos dos `user1` e `user2`. Essa duplicação viola o princípio **DRY (Don't Repeat Yourself)**. Se for necessário adicionar um novo campo (por exemplo, `avatarUrl`) à seleção de usuário, será preciso alterar em quatro lugares diferentes, o que é ineficiente e propenso a erros.

### Refatoração Sugerida

Extrair o objeto de seleção para uma constante e reutilizá-la nas consultas do Prisma. Isso centraliza a lógica e facilita futuras manutenções.

**Arquivo:** `backend/src/repositories/chat.ts`

```typescript
import { PrismaClient } from '@prisma/client'
import { prisma } from '../database.js'
import { CreateChatRepositoryDTO } from './chat.dto.js'

// Constante reutilizável para a seleção de campos do usuário
const userSelect = {
  id: true,
  name: true,
}

export class ChatRepository {
  constructor(private readonly repository: PrismaClient) {}

  // ... outros métodos

  async getChatsAndLastMessageByUserId(userId: string) {
    return this.repository.chat.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        user1: { select: userSelect }, // Reutilização
        user2: { select: userSelect }, // Reutilização
      },
    })
  }

  async getChatWithMessagesByUserAndChatId(userId: string, chatId: string) {
    return this.repository.chat.findFirst({
      where: {
        id: chatId,
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        user1: { select: userSelect }, // Reutilização
        user2: { select: userSelect }, // Reutilização
      },
    })
  }
}
```

-----

## 2\. Números Mágicos (Magic Numbers)

### Trecho do Código Original

**Arquivo:** `backend/src/controllers/animal/create-animal.ts`

```typescript
// ...
      const statusCode = result.isFailure() ? 400 : 201

      return response.status(statusCode).json(result.value)
    } catch (err) {
      const error = err as Error
      console.error('Error creating animal:', error)
      return response.status(500).json({ error: error.message })
    }
// ...
```

### Smell Identificado

O uso de números literais como `400`, `201` e `500` para representar status codes HTTP é considerado um *code smell*. Embora sejam códigos conhecidos, eles carecem de contexto explícito, o que pode dificultar a leitura para desenvolvedores menos experientes com o protocolo HTTP. O código não expressa textualmente o que cada número significa ("Bad Request", "Created", "Internal Server Error").

### Refatoração Sugerida

Substituir os números mágicos por constantes nomeadas, preferencialmente de um `enum` ou objeto, para tornar o código mais legível e auto-documentado.

**Arquivo:** `backend/src/controllers/animal/create-animal.ts`

```typescript
import { Request, Response } from 'express'
// ...

// Pode ser importado de um arquivo de constantes/utils
enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  INTERNAL_SERVER_ERROR = 500,
}

class CreateAnimalController {
  // ...
  async handle(request: Request, response: Response): Promise<Response> {
    // ...
    try {
      // ...
      const statusCode = result.isFailure()
        ? HttpStatusCode.BAD_REQUEST
        : HttpStatusCode.CREATED

      return response.status(statusCode).json(result.value)
    } catch (err) {
      const error = err as Error
      console.error('Error creating animal:', error)
      return response
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ error: error.message })
    }
  }
}
```

-----

## 3\. Tratamento Implícito de Nulos (Implicit Null Handling)

### Trecho do Código Original

**Arquivo:** `backend/src/controllers/animal/create-animal.ts`

```typescript
// ...
      const result = await this.createAnimal.execute({
        name,
        type,
        gender,
        race,
        description,
        userId: user?.id || '', // Linha problemática
        pictures: pictureBuffers,
      })
// ...
```

### Smell Identificado

A expressão `user?.id || ''` mascara um problema grave. Se `request.user` não existir (ou seja, o usuário não está autenticado), o código não falha. Em vez disso, ele passa uma string vazia `''` como `userId` para a camada de serviço. Isso pode causar um erro inesperado no banco de dados ou, pior, a criação de dados órfãos. A ação de criar um animal deve falhar de forma explícita se o usuário não estiver autenticado.

### Refatoração Sugerida

Adicionar uma verificação explícita (*guard clause*) no início do método para garantir que o usuário está autenticado. Se não estiver, retornar um erro de "Não Autorizado" (`401`) imediatamente. Isso torna a pré-condição da rota clara e o sistema mais robusto.

**Arquivo:** `backend/src/controllers/animal/create-animal.ts`

```typescript
// ... (imports, incluindo o HttpStatusCode da refatoração anterior)

class CreateAnimalController {
  constructor(private readonly createAnimal: CreateAnimalService) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const { user } = request

    // Guard Clause: Falha rápida se o usuário não estiver autenticado
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
        userId: user.id, // Agora temos a garantia de que `user.id` existe
        pictures: pictureBuffers,
      })
      // ...
    } catch (err) {
      // ...
    }
  }
}
```

```
```
