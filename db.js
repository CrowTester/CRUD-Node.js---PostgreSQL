// Importamos o driver do Postgres
import pg from 'pg';
const { Pool } = pg;

// Criamos uma nova instância do Pool de conexões
const pool = new Pool({
  user: 'Davi',
  host: 'localhost',
  database: 'class work',
  password: '1234',
  port: 5433,
});

export default pool;