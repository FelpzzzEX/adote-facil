# Princípios e Padrões de Projeto - Adote-Fácil

Este documento descreve a aplicação de princípios de projeto de software e padrões de projeto (Design Patterns) identificados na aplicação Adote-Fácil, bem como sugestões de melhorias.

## 1. Princípios SOLID

Os princípios SOLID são diretrizes que ajudam a criar software mais compreensível, flexível e manutenível. A estrutura do projeto já segue vários desses princípios.

### **S - Single Responsibility Principle (Princípio da Responsabilidade Única)**

Este princípio afirma que uma classe (ou módulo) deve ter apenas um motivo para mudar.

* **Aplicação (Backend):** O backend demonstra uma clara aplicação deste princípio. A estrutura é dividida em camadas com responsabilidades bem definidas:
    * `controllers`: Responsáveis exclusivamente por receber as requisições HTTP, validar dados de entrada e retornar respostas. Eles não contêm lógica de negócio.
    * `services`: Contêm a lógica de negócio central da aplicação.
    * `repositories`: Responsáveis pela comunicação com o banco de dados, abstraindo a lógica de acesso a dados.
    * `providers`: Responsáveis pela integração com serviços externos (ex: envio de e-mail, armazenamento de arquivos).

* **Aplicação (Frontend):** A estrutura do frontend também segue o princípio:
    * `components`: Componentes pequenos e reutilizáveis, cada um com a única responsabilidade de renderizar uma parte da UI.
    * `api`: Centraliza toda a lógica de comunicação com o backend.
    * `contexts`/`providers`: Gerenciam um estado global específico (ex: autenticação do usuário, lista de animais), isolando a gestão de estado dos componentes.

### **O - Open/Closed Principle (Princípio Aberto/Fechado)**

O software deve ser aberto para extensão, mas fechado para modificação.

* **Aplicação (Backend):** A arquitetura com `services` e `repositories` permite a extensão sem modificação. Por exemplo, se quiséssemos suportar um novo banco de dados (além do Prisma), poderíamos criar uma nova implementação da interface do repositório sem alterar os `services` que a consomem.

### **L - Liskov Substitution Principle (Princípio da Substituição de Liskov)**

Subtipos devem ser substituíveis por seus tipos base. Este princípio é garantido quando usamos interfaces (como no exemplo acima) para que diferentes implementações de um repositório ou provedor possam ser trocadas sem quebrar o sistema.

### **I - Interface Segregation Principle (Princípio da Segregação de Interface)**

Clientes não devem ser forçados a depender de interfaces que não utilizam.

* **Sugestão de Aplicação:** Ao definir as interfaces para os repositórios, é bom criar interfaces específicas para as necessidades de cada serviço, em vez de uma única interface genérica para todas as operações de banco de dados. A estrutura atual com uma pasta `repositories` permite e incentiva essa prática.

### **D - Dependency Inversion Principle (Princípio da Inversão de Dependência)**

Módulos de alto nível não devem depender de módulos de baixo nível. Ambos devem depender de abstrações.

* **Aplicação (Backend):** Este é um dos princípios mais bem aplicados na estrutura do backend, confirmado pelo arquivo `create-animal.spec.ts`. Os `services` (alto nível) não dependem diretamente do Prisma. Em vez disso, dependem das abstrações (interfaces) dos `repositories`, que são injetadas via construtor. Este desacoplamento é fundamental para a testabilidade e manutenção do projeto.

---

## 2. Padrões de Projeto (Design Patterns)

### Padrões Identificados

#### **1. Repository Pattern**

* **Descrição:** Isola a lógica de acesso a dados do restante da aplicação. A camada de negócio interage com uma interface de repositório, não com a implementação concreta do acesso a dados.
* **Aplicação (Backend):** A evidência do uso deste padrão é clara nos testes dos serviços, como em `create-animal.spec.ts`. O serviço `CreateAnimalService` depende da abstração `AnimalRepository` e não de uma implementação concreta, permitindo que uma versão "mock" (falsa) seja injetada durante os testes. Isso desacopla a lógica de negócio do acesso a dados.

* *Exemplo de código:*
    ```typescript
    // Em backend/src/services/animal/create-animal.spec.ts

    import { AnimalRepository } from '../../repositories/animal.js'
    import { CreateAnimalService } from './create-animal.js'
    // ...

    describe('CreateAnimalService', () => {
      let sut: CreateAnimalService
      let animalRepository: MockProxy<AnimalRepository>
      // ...

      beforeAll(() => {
        // O repositório é "mockado" (simulado)
        animalRepository = mock<AnimalRepository>()
        // ...

        // O serviço recebe a dependência do repositório em seu construtor
        sut = new CreateAnimalService(animalRepository, animalImageRepository)
      })

      test('should call animal repository with correct values', async () => {
        await sut.execute(defaultParams)

        // O teste verifica se o método do repositório foi chamado corretamente
        expect(animalRepository.create).toHaveBeenCalledWith({ /* ... */ })
      })
    })
    ```

#### **2. Provider Pattern (Context API)**

* **Descrição:** O Provider Pattern é uma forma de compartilhar dados ou estado entre múltiplos componentes sem ter que passar props manualmente através de todos os níveis da árvore de componentes.
* **Aplicação (Frontend):** O arquivo `frontend/src/contexts/animals.tsx` confirma o uso da Context API do React, que é uma implementação deste padrão para gerenciar estado compartilhado.

* *Exemplo de código:*
    ```tsx
    // Em contexts/animals.tsx
    import React, { createContext, useState, useContext } from 'react';

    // ...

    export const AnimalsContextProvider = ({ children }) => {
      const [userAnimals, setUserAnimals] = useState<Animal[]>([]);
      // ...

      return (
        <AnimalsContext.Provider value={{ /* ...valores... */ }}>
          {children}
        </AnimalsContext.Provider>
      );
    };
    ```
