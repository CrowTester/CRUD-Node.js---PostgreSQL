import express from 'express';
import pool from './db.js';

const app = express();
app.use(express.json());

// ROTA DE LISTAGEM (READ) - GET /livros
app.get('/livros', async (req, res) => {
  try {
    const { autor } = req.query;
    let sql = 'SELECT * FROM livros';
    let params = [];
    if (autor) {
      sql += ' WHERE autor = $1';
      params = [autor];
    }
    const resultado = await pool.query(sql, params);
    return res.json(resultado.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro no banco de dados" });
  }
});

// ROTA DE DETALHES (READ) - GET /livros/:id
app.get('/livros/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await pool.query('SELECT * FROM livros WHERE id = $1', [id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Livro não encontrado" });
    }
    return res.json(resultado.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro no banco de dados" });
  }
});

// ROTA DE CRIAÇÃO (CREATE) - POST /livros
app.post('/livros', async (req, res) => {
  const { titulo, autor, ano_publicacao } = req.body;
  if (!titulo || !autor) {
    return res.status(400).json({ erro: "Título e autor são obrigatórios" });
  }
  try {
    const novoLivro = await pool.query(
      'INSERT INTO livros (titulo, autor, ano_publicacao) VALUES ($1, $2, $3) RETURNING *',
      [titulo, autor, ano_publicacao]
    );
    return res.status(201).json(novoLivro.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao salvar" });
  }
});

// ROTA DE ATUALIZAÇÃO (UPDATE) - PUT /livros/:id
app.put('/livros/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, autor, ano_publicacao, disponivel } = req.body;
  try {
    const resultado = await pool.query(
      'UPDATE livros SET titulo = $1, autor = $2, ano_publicacao = $3, disponivel = $4 WHERE id = $5 RETURNING *',
      [titulo, autor, ano_publicacao, disponivel, id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Livro não encontrado" });
    }
    return res.json(resultado.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao atualizar" });
  }
});

// ROTA DE EXCLUSÃO (DELETE) - DELETE /livros/:id
app.delete('/livros/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await pool.query('DELETE FROM livros WHERE id = $1 RETURNING *', [id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Livro não encontrado" });
    }
    return res.json({ mensagem: "Livro removido com sucesso" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao deletar" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});