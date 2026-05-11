// Importamos o driver do Postgres
import pg from 'pg';
const { Pool } = pg;

// Criamos uma nova instância do Pool de conexões
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'dice storage',
  password: 'senai',
  port: 5433,
});

export default pool;