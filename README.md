# Livraria API

API REST para gerenciamento de livros em uma livraria, utilizando Node.js e PostgreSQL sem ORM.

## Configuração

1. Instale as dependências:
   ```
   npm install
   ```

2. Configure o PostgreSQL:
   - Crie um banco de dados.
   - Execute o script SQL para criar a tabela:

   ```sql
   CREATE TABLE livros (
     id SERIAL PRIMARY KEY,
     titulo VARCHAR(255) NOT NULL,
     autor VARCHAR(255) NOT NULL,
     ano_publicacao INTEGER,
     disponivel BOOLEAN DEFAULT true
   );
   ```

3. Atualize `db.js` com suas credenciais do PostgreSQL.

4. Execute o servidor:
   ```
   node server.js
   ```

## Endpoints

- `GET /livros` - Lista todos os livros (opcional: `?autor=...` para filtrar)
- `GET /livros/:id` - Detalhes de um livro
- `POST /livros` - Cria um novo livro (JSON: titulo, autor, ano_publicacao)
- `PUT /livros/:id` - Atualiza um livro
- `DELETE /livros/:id` - Remove um livro

## Teste

Use Postman ou curl para testar os endpoints.