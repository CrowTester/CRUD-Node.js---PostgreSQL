# API de Pedidos e Clientes

API REST para gerenciamento de clientes e pedidos em uma cafeteria, utilizando Node.js e PostgreSQL sem ORM.

## Configuração

1. Instale as dependências:
   ```
   npm install
   ```

2. Configure o PostgreSQL:
   - Crie um banco de dados.
   - Execute o script SQL para criar as tabelas:

   ```sql
   CREATE TABLE IF NOT EXISTS clientes (
     id SERIAL PRIMARY KEY,
     nome VARCHAR(255) NOT NULL,
     email VARCHAR(255) UNIQUE NOT NULL
   );

   CREATE TABLE IF NOT EXISTS pedidos (
     id SERIAL PRIMARY KEY,
     produto VARCHAR(255) NOT NULL,
     valor NUMERIC(10,2) NOT NULL,
     status VARCHAR(50) DEFAULT 'pendente',
     cliente_id INTEGER REFERENCES clientes(id)
   );
   ```

3. Atualize `db.js` com suas credenciais do PostgreSQL.

4. Execute o servidor:
   ```
   node server.js
   ```

## Endpoints

### Clientes
- `POST /clientes` - Cadastra novo cliente.
- `GET /clientes` - Lista todos os clientes.
- `PUT /clientes/:id` - Atualiza dados do cliente por ID.
- `DELETE /clientes/:id` - Remove cliente.
- `GET /clientes/:id/pedidos` - Lista todos os pedidos de um cliente.

### Pedidos
- `POST /pedidos` - Cadastra novo pedido vinculado a um cliente.
- `GET /pedidos` - Lista pedidos com o nome do cliente.
- `GET /pedidos?status=entregue` - Filtra pedidos por status.
- `GET /pedidos/:id` - Detalhes de um pedido específico.
- `GET /pedidos/nome/:nome` - Busca pedidos por nome do produto.
- `PUT /pedidos/:id` - Atualiza dados do pedido por ID.

## Boas práticas

- Usa queries parametrizadas para evitar SQL Injection.
- Valida `cliente_id` antes de criar pedidos.
- Valida que `status` seja apenas: `pendente`, `preparando` ou `entregue`.

## Teste

Use Postman, Insomnia ou curl para testar os endpoints.

Exemplo de criação de pedido:

```json
{
  "produto": "Cappuccino",
  "valor": 12.5,
  "status": "pendente",
  "cliente_id": 1
}
```
