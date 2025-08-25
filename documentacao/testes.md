# Testes Automatizados

Este documento descreve os testes automatizados implementados no projeto bem como instruções para sua execução e análise dos testes unitários existentes e propostas de melhorias.

---

## Instruções de Execução

### 1. Instalar Dependências
Certifique-se de ter o **Node.js** instalado em sua máquina.  
No diretório raiz do projeto, execute:

```bash
npm install
````

### 2. Executar os Testes com Cypress

No diretório raiz do projeto, execute para a instalação do Cypress:

```bash
npm install cypress --save-dev
```

Para abrir a interface interativa do Cypress:

```bash
npx cypress open
```

Isso abrirá a interface gráfica, onde é possível visualizar e executar os testes manualmente.

### 3. Estrutura dos Testes

Os testes estão localizados no diretório:

```bash
cypress/e2e/
```

---

## Cenários de Teste Automatizados

### 1. Login de Usuário

#### Cenário Principal

* **Dado** que o usuário acessa a tela de login,
* **Quando** ele informa credenciais válidas (`maria@mail.com / 12345678`) e confirma,
* **Então** o sistema deve autenticar, redirecionar para a página de animais disponíveis para adoção e exibir o título da página.

**Objetivo:** validar que o login funciona corretamente e direciona o usuário para a área logada.

#### Cenário Alternativo 1

* **Dado** que o usuário acessa a tela de login,
* **Quando** ele informa uma senha incorreta,
* **Então** o sistema deve exibir um alerta *“Email ou senha inválidos”* e permanecer na tela de login.

**Objetivo:** validar tratamento de credenciais inválidas.

#### Cenário Alternativo 2

* **Dado** que o usuário acessa a tela de login,
* **Quando** ele tenta entrar sem preencher o campo de email,
* **Então** o sistema deve apresentar mensagem de validação informando que o campo é obrigatório e não deve prosseguir para a área logada.

**Objetivo:** validar a obrigatoriedade do preenchimento de campos.

---

### 2. Cadastro de Usuário

#### Cenário Principal

* **Dado** que o usuário acessa a tela de cadastro,
* **Quando** ele informa todos os dados válidos (nome, email, senha, confirmação da senha) e envia,
* **Então** o sistema deve exibir a mensagem *“Cadastro efetuado com sucesso! Faça login para acessar nossa plataforma!”*.

**Objetivo:** garantir que um novo usuário pode se cadastrar corretamente.

#### Cenário Alternativo 1

* **Dado** que o usuário acessa a tela de cadastro,
* **Quando** ele tenta cadastrar usando um email já existente,
* **Então** o sistema deve alertar que o email já está cadastrado.

**Objetivo:** evitar cadastros duplicados.

#### Cenário Alternativo 2

* **Dado** que o usuário acessa a tela de cadastro,
* **Quando** ele tenta submeter o formulário sem preencher nenhum campo,
* **Então** o sistema deve exibir mensagens de erro de validação (ex.: *“O nome é obrigatório”*).

**Objetivo:** garantir validação de campos obrigatórios.

---

### 3. Cadastro de Animal para Adoção

#### Cenário Principal

* **Dado** que o usuário está logado e acessa a página de disponibilização de animal,
* **Quando** ele informa todos os dados válidos (nome, raça, descrição, tipo, gênero, foto) e envia,
* **Então** o sistema deve exibir a mensagem *“Animal cadastrado com sucesso!”* e redirecionar para a página de “Meus Animais”.

**Objetivo:** garantir que o cadastro de animal funciona de ponta a ponta.

#### Cenário Alternativo 1

* **Dado** que o usuário acessa a página de disponibilização de animal,
* **Quando** ele tenta enviar o formulário sem preencher os campos obrigatórios,
* **Então** o sistema deve exibir mensagens de erro (ex.: *“O nome é obrigatório”*, *“O tipo é obrigatório”*).

**Objetivo:** validar a obrigatoriedade dos campos.

#### Cenário Alternativo 2

* **Dado** que o usuário acessa a página de disponibilização de animal,
* **Quando** ele tenta enviar mais de 5 fotos no cadastro,
* **Então** o sistema deve exibir a mensagem *“Você pode adicionar no máximo 5 fotos!”* e não deve adicionar nenhuma.

**Objetivo:** validar regra de negócio para limite de anexos.

---

## Proposta de Melhorias nos Testes Unitários

1. **Utilizar `beforeEach` para Melhor Isolamento de Testes**
   Atualmente muitos testes usam `beforeAll`, o que pode compartilhar estado entre testes.
   Sugestão: substituir por `beforeEach` para garantir isolamento e reconfiguração de mocks antes de cada execução.

2. **Clareza na Organização dos Testes**
   Seguir a convenção *Given-When-Then* nos nomes dos testes para facilitar entendimento.

   **Exemplo:**

   ```js
   should return Failure when repository returns null
   should call repository with correct values when executing service
   should return Success when animal is created successfully
   ```

```
