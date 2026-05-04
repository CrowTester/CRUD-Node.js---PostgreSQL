import express from 'express';
import pool from './db.js';

const app = express();
app.use(express.json());

// ROTA DE LISTAGEM (READ)
app.get('/usuarios', async (req, res) => {
  try {
    // Executamos a query SQL
    const resultado = await pool.query('SELECT * FROM usuarios');
    return res.json(resultado.rows);
  } catch (err) {
    return res.status(500).json({ erro: "Erro no banco de dados" });
  }
});

// ROTA DE CRIAÇÃO (CREATE)
app.post('/usuarios', async (req, res) => {
  const { nome, email } = req.body;
  try {
    const novoUsuario = await pool.query(
      'INSERT INTO usuarios (nome, email) VALUES ($1, $2) RETURNING *',
      [nome, email]
    );
    return res.status(201).json(novoUsuario.rows[0]);
  } catch (err) {
    return res.status(500).json({ erro: "Erro ao salvar" });
  }
});