import express from 'express';
import pool from './db.js';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const VALID_STATUSES = ['pendente', 'preparando', 'entregue'];

function parsePositiveInteger(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function parseNumericValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

// Clientes
app.get('/clientes', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM clientes ORDER BY id');
    return res.json(resultado.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Erro no banco de dados' });
  }
});

app.post('/clientes', async (req, res) => {
  const { nome, email } = req.body;
  if (!nome || !email) {
    return res.status(400).json({ erro: 'Nome e email são obrigatórios' });
  }
  try {
    const resultado = await pool.query(
      'INSERT INTO clientes (nome, email) VALUES ($1, $2) RETURNING *',
      [nome, email]
    );
    return res.status(201).json(resultado.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(400).json({ erro: 'Email já cadastrado' });
    }
    return res.status(500).json({ erro: 'Erro ao salvar cliente' });
  }
});

app.put('/clientes/:id', async (req, res) => {
  const { id } = req.params;
  const clienteId = parsePositiveInteger(id);
  const { nome, email } = req.body;

  if (!clienteId) {
    return res.status(400).json({ erro: 'ID de cliente inválido' });
  }
  if (!nome && !email) {
    return res.status(400).json({ erro: 'Informe nome ou email para atualizar' });
  }
  try {
    const resultado = await pool.query(
      `UPDATE clientes
       SET nome = COALESCE(NULLIF($1, ''), nome),
           email = COALESCE(NULLIF($2, ''), email)
       WHERE id = $3
       RETURNING *`,
      [nome, email, clienteId]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }
    return res.json(resultado.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(400).json({ erro: 'Email já cadastrado' });
    }
    return res.status(500).json({ erro: 'Erro ao atualizar cliente' });
  }
});

app.delete('/clientes/:id', async (req, res) => {
  const { id } = req.params;
  const clienteId = parsePositiveInteger(id);
  if (!clienteId) {
    return res.status(400).json({ erro: 'ID de cliente inválido' });
  }
  try {
    const resultado = await pool.query('DELETE FROM clientes WHERE id = $1 RETURNING *', [clienteId]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }
    return res.json({ mensagem: 'Cliente removido com sucesso' });
  } catch (err) {
    console.error(err);
    if (err.code === '23503') {
      return res.status(400).json({ erro: 'Não é possível excluir cliente com pedidos ativos' });
    }
    return res.status(500).json({ erro: 'Erro ao deletar cliente' });
  }
});

app.get('/clientes/:id/pedidos', async (req, res) => {
  const { id } = req.params;
  const clienteId = parsePositiveInteger(id);
  if (!clienteId) {
    return res.status(400).json({ erro: 'ID de cliente inválido' });
  }
  try {
    const clienteResult = await pool.query('SELECT id, nome, email FROM clientes WHERE id = $1', [clienteId]);
    if (clienteResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    const pedidosResult = await pool.query(
      `SELECT p.id, p.produto, p.valor, p.status, p.cliente_id,
              c.nome AS cliente_nome, c.email AS cliente_email
       FROM pedidos p
       JOIN clientes c ON c.id = p.cliente_id
       WHERE p.cliente_id = $1
       ORDER BY p.id`,
      [clienteId]
    );

    return res.json({ cliente: clienteResult.rows[0], pedidos: pedidosResult.rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Erro ao buscar pedidos do cliente' });
  }
});

// Pedidos
app.get('/pedidos', async (req, res) => {
  const { status } = req.query;
  let sql = `SELECT p.id, p.produto, p.valor, p.status, p.cliente_id,
                    c.nome AS cliente_nome, c.email AS cliente_email
               FROM pedidos p
               JOIN clientes c ON c.id = p.cliente_id`;
  const params = [];

  if (status) {
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ erro: 'Status inválido para filtro' });
    }
    sql += ' WHERE p.status = $1';
    params.push(status);
  }

  sql += ' ORDER BY p.id';

  try {
    const resultado = await pool.query(sql, params);
    return res.json(resultado.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Erro no banco de dados' });
  }
});


app.get('/pedidos/:id', async (req, res) => {
  const { id } = req.params;
  const pedidoId = parsePositiveInteger(id);
  if (!pedidoId) {
    return res.status(400).json({ erro: 'ID de pedido inválido' });
  }

  try {
    const resultado = await pool.query(
      `SELECT p.id, p.produto, p.valor, p.status, p.cliente_id,
              c.nome AS cliente_nome, c.email AS cliente_email
       FROM pedidos p
       JOIN clientes c ON c.id = p.cliente_id
       WHERE p.id = $1`,
      [pedidoId]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }
    return res.json(resultado.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Erro no banco de dados' });
  }
});

app.post('/pedidos', async (req, res) => {
  const { produto, valor, status = 'pendente', cliente_id } = req.body;
  if (!produto || valor === undefined || cliente_id === undefined) {
    return res.status(400).json({ erro: 'Produto, valor e cliente_id são obrigatórios' });
  }
  const numericValor = parseNumericValue(valor);
  const clienteId = parsePositiveInteger(cliente_id);

  if (numericValor === null) {
    return res.status(400).json({ erro: 'Valor deve ser um número válido' });
  }
  if (!clienteId) {
    return res.status(400).json({ erro: 'cliente_id inválido' });
  }
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ erro: "Status deve ser 'pendente', 'preparando' ou 'entregue'" });
  }

  try {
    const clienteResult = await pool.query('SELECT id FROM clientes WHERE id = $1', [clienteId]);
    if (clienteResult.rows.length === 0) {
      return res.status(400).json({ erro: 'Cliente não encontrado' });
    }

    const resultado = await pool.query(
      'INSERT INTO pedidos (produto, valor, status, cliente_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [produto, numericValor, status, clienteId]
    );
    return res.status(201).json(resultado.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Erro ao criar pedido' });
  }
});

app.put('/pedidos/:id', async (req, res) => {
  const { id } = req.params;
  const pedidoId = parsePositiveInteger(id);
  const { produto, valor, status, cliente_id } = req.body;

  if (!pedidoId) {
    return res.status(400).json({ erro: 'ID de pedido inválido' });
  }
  if (!produto && valor === undefined && !status && cliente_id === undefined) {
    return res.status(400).json({ erro: 'Informe pelo menos um campo para atualizar' });
  }

  const numericValor = valor !== undefined ? parseNumericValue(valor) : null;
  const clienteId = cliente_id !== undefined ? parsePositiveInteger(cliente_id) : null;

  if (valor !== undefined && numericValor === null) {
    return res.status(400).json({ erro: 'Valor deve ser um número válido' });
  }
  if (cliente_id !== undefined && !clienteId) {
    return res.status(400).json({ erro: 'cliente_id inválido' });
  }
  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ erro: "Status deve ser 'pendente', 'preparando' ou 'entregue'" });
  }

  try {
    if (clienteId) {
      const clienteResult = await pool.query('SELECT id FROM clientes WHERE id = $1', [clienteId]);
      if (clienteResult.rows.length === 0) {
        return res.status(400).json({ erro: 'Cliente não encontrado' });
      }
    }

    const resultado = await pool.query(
      `UPDATE pedidos
       SET produto = COALESCE(NULLIF($1, ''), produto),
           valor = COALESCE($2, valor),
           status = COALESCE(NULLIF($3, ''), status),
           cliente_id = COALESCE($4, cliente_id)
       WHERE id = $5
       RETURNING *`,
      [produto, numericValor, status, clienteId, pedidoId]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }
    return res.json(resultado.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Erro ao atualizar pedido' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
