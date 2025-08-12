Análise da Arquitetura

Após analisar a estrutura do repositório, podemos concluir que a arquitetura do projeto segue o modelo organizado em camadas, implementando o padrão Cliente-Servidor. Essa abordagem é apresentada pela separação de responsabilidades:

- Frontend (Cliente): A camada com a qual o usuário interage.

- Backend (Servidor): A camada que concentra a lógica de negócio, as regras da aplicação e o acesso aos dados.

A comunicação entre essas duas camadas é realizada por meio de requisições de API, que são disparadas a partir das interações do usuário no frontend.

## Diagrama de Pacotes

```mermaid
---
config:
  layout: dagre
---
flowchart TD
    subgraph Backend Layers
        Routes
        Controllers
        Services
        Repositories
        DB[("Banco de Dados")]
    end

    Usuario["Usuário"] --> Frontend["Next.js / React"]
    Frontend -- HTTP --> Backend["Express API"]

    Backend --> Routes
    Routes --> Controllers
    Controllers --> Services
    Services --> Repositories
    Repositories --> DB

