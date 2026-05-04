import pg from 'pg';
const { Pool } = pg;

// Criamos uma nova instância do Pool de conexões
const pool = new Pool({
  user: 'seu_usuario',
  host: 'localhost',
  database: 'nome_do_seu_banco',
  password: 'sua_senha',
  port: 5433  ,
});

export default pool;