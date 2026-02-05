const express = require('express');
const { query } = require('../db');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const result = await query(
    'SELECT id, title, description, owner_id, created_at FROM items ORDER BY id DESC'
  );
  res.json({ items: result.rows });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await query(
    'SELECT id, title, description, owner_id, created_at FROM items WHERE id = $1',
    [id]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Item not found.' });
  }
  res.json({ item: result.rows[0] });
}));

router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required.' });
  }

  const result = await query(
    'INSERT INTO items (title, description, owner_id) VALUES ($1, $2, $3) RETURNING id, title, description, owner_id, created_at',
    [title, description || null, req.user.userId]
  );

  res.status(201).json({ item: result.rows[0] });
}));

router.put('/:id', requireAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  const existing = await query('SELECT owner_id FROM items WHERE id = $1', [id]);
  if (existing.rows.length === 0) {
    return res.status(404).json({ error: 'Item not found.' });
  }
  if (existing.rows[0].owner_id !== req.user.userId) {
    return res.status(403).json({ error: 'Not allowed to update this item.' });
  }

  const result = await query(
    'UPDATE items SET title = $1, description = $2 WHERE id = $3 RETURNING id, title, description, owner_id, created_at',
    [title || 'Untitled', description || null, id]
  );

  res.json({ item: result.rows[0] });
}));

router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existing = await query('SELECT owner_id FROM items WHERE id = $1', [id]);
  if (existing.rows.length === 0) {
    return res.status(404).json({ error: 'Item not found.' });
  }
  if (existing.rows[0].owner_id !== req.user.userId) {
    return res.status(403).json({ error: 'Not allowed to delete this item.' });
  }

  await query('DELETE FROM items WHERE id = $1', [id]);
  res.status(204).send();
}));

module.exports = router;
