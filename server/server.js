import app from './app.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
  })
  .then(() => console.log('DB connection successful!'))
  .catch((err) => console.error('DB connection error:', err));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
