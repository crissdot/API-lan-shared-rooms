import express, { Express } from 'express';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { setupSequelize } from './core/sequelize';
import { routerApi } from './controllers';
import { logErrors, httpErrorHandler, ormErrorHandler, errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(express.json());

app.get('/', (req, res) => {
  return res.send('All fine!');
});

routerApi(app);

app.use(logErrors);
app.use(httpErrorHandler);
app.use(ormErrorHandler);
app.use(errorHandler);

const server = app.listen(port, async () => {
  try {
    const sequelize = await setupSequelize();
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return;
  }
});

const io = new Server(server);

let usersCount = 0;

io.on('connection', (socket) => {
  console.log('A user connected');
  usersCount++;
  io.emit('count_updated', {count: usersCount});

  io.on('disconnect', () => {
    console.log('User disconnected');
    usersCount--;
    io.emit('count_updated', {count: usersCount});
  });
});
