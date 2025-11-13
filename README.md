# Despesathor 2.0 - Aplicação Frontend

[](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[](https://developer.mozilla.org/pt-BR/docs/Web/HTML)
[](https://getbootstrap.com/docs/4.0/getting-started/introduction/)
[](https://www.google.com/search?q=https://github.com/joaomoreir4/projeto-despesathor-v2-frontend)

Este é o frontend (aplicação cliente) do projeto **Despesathor 2.0**, uma aplicação de gestão de despesas pessoais.

Esta aplicação foi **migrada** de uma arquitetura de protótipo (que usava `localStorage`) para uma aplicação web moderna que consome uma API RESTful (backend) dedicada.

O backend (API Java/Spring Boot) que esta aplicação consome pode ser encontrado aqui:
**[https://github.com/joaomoreir4/despesathor-v2-api](https://github.com/joaomoreir4/despesathor-v2-api)**

## 1\. Sobre o Projeto

O objetivo principal foi refatorar um projeto de JavaScript "clássico" (baseado em manipulação direta do DOM e `localStorage`) para uma arquitetura full-stack desacoplada.

Esta aplicação agora lida com todo o estado da UI, validação de formulários no lado do cliente e comunicação de rede (via `fetch`) com o backend.

## 2\. Arquitetura e Decisões de Design

O código JavaScript (`app.js`) foi reestruturado para ser mais limpo, profissional e de fácil manutenção, aplicando os seguintes conceitos:

  * **Migração de Persistência:** Toda a lógica da `class Bd` (que gerenciava o `localStorage`) foi removida e substituída por chamadas de API (`fetch`) para os endpoints `GET`, `POST`, `PUT` e `DELETE`.
  * **Padrão "Factory" (Fábrica):** A função `obterDados(modo)` atua como uma "fábrica" que lê os formulários de "Cadastro" ou "Edição" e retorna uma instância da classe `Despesa`, evitando a duplicação de código (princípio DRY).
  * **Classe como "Tradutor" (DTO):** A `class Despesa` (no `app.js`) atua como um tradutor. O seu método `.traduzirParaApi()` converte os dados "crus" do formulário (ex: `dia: "30"`, `mes: "10"`, `categoria: "3"`) para o formato JSON exato que o backend Java espera (ex: `data: "2025-10-30"`, `categoria: "LAZER"`).
  * **Fonte Única da Verdade (Single Source of Truth):** A lógica de tradução de categorias foi centralizada em "Mapas" (Objetos JS, ex: `CAT_API_PARA_FRONT`), tornando o código mais fácil de manter.
  * **Gestão de Estado:** A aplicação usa "Alertas de Erro" (controlados via `classList` e `.innerHTML`) para dar feedback visual ao usuário.
  * **Separação de Responsabilidades:** O `DOMContentLoaded` atua como o "cérebro", detetando em qual página o utilizador está (`consulta.html`, `resumo.html`) e chamando as funções de carregamento corretas.

## 3\. Funcionalidades

  * **CRUD Completo:** A aplicação suporta Criar, Ler, Atualizar e Apagar despesas.
  * **Edição em Modal (UX):** A atualização de dados (Update) é feita num modal na própria página de consulta, sem a necessidade de recarregar a página, proporcionando uma experiência de utilizador mais fluida.
  * **Consulta com Filtros Dinâmicos:** A página de "Consulta" comunica com o endpoint `GET /despesas` e envia os filtros (`?ano=...`, `?categoria=...`) para que o backend faça a filtragem.
  * **Resumo com Agregação (Eficiente):** A página de "Resumo" chama um endpoint separado (`GET /despesas/total`) que pede ao backend para fazer a soma (`SUM()`) dos valores, recebendo apenas o total (em vez de uma lista gigante) para máxima eficiência.
  * **Validação de Formulário (Client-Side):** A função `formataCampos` usa `addEventListener` para validar os campos "Dia" e "Valor" em tempo real, impedindo a inserção de dados inválidos (letras, múltiplos pontos, etc.).

## 4\. Pilha Tecnológica (Tech Stack)

  * **HTML5** (Estrutura)
  * **CSS3** (Estilização personalizada)
  * **Bootstrap 4.0** (Framework de UI e Grid)
  * **JavaScript (ES6+)** (Lógica, Eventos e Manipulação de DOM)
  * **jQuery** (Apenas para o controlo dos Modais do Bootstrap)
  * **Font Awesome** (Ícones)
  * **Fetch API** (Comunicação de Rede)

## 5\. Como Executar Localmente

Para executar este frontend, o **backend (API) deve estar em execução** primeiro.

1.  **Iniciar o Backend:** Siga as instruções no [README do repositório da API]([https://github.com/joaomoreir4/despesathor-v2-api/blob/main/README.md]) para iniciar o servidor Java em `http://localhost:8080`.
2.  **Clonar este repositório:**
    ```bash
    git clone https://github.com/joaomoreir4/projeto-despesathor-v2-frontend.git
    cd projeto-despesathor-v2-frontend
    ```
3.  **Abrir os Arquivos:**
      * Verifique se a sua API backend está permitindo CORS. O `DespesaController` (Java) deve ter a anotação `@CrossOrigin(origins = "*")`.
      * Verifique se as URLs de `fetch` no `app.js` estão apontando para `http://localhost:8080`.
      * Abra os arquivos `index.html`, `consulta.html` ou `resumo.html` diretamente no seu navegador.

*(Nota: Para a melhor experiência (evitando potenciais problemas de CORS com `file:///`), é recomendado executar os arquivos a partir de um servidor local, como a extensão "Live Server" do VS Code.)*

## 6\. Objetivos Futuros (Roadmap)

  * [ ] Migrar este frontend de JavaScript puro para uma **SPA (Single Page Application) com React**.
  * [ ] Fazer o deploy deste Frontend no **Firebase Hosting**
  * [ ] Fazer o deploy do Backend no **Google Cloud Run** e **Cloud SQL**.
