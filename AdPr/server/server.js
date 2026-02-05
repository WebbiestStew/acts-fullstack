const express = require('express');
const cors = require('cors');
const { validateEnv, config } = require('./config');
const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const { notFound, errorHandler } = require('./middleware/errorHandler');

validateEnv();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
