import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';

import * as sensors from './sensors';

export const start = () => {
  const app = express();

  const PORT = process.env.port || 4000;

  app.get('/sensors/:sensorId', (req, res) => {
    res.status(200)
      .json(sensors.get(req.params.sensorId));
  });

  app.get('/sensors', (req, res) => {
    res.status(200)
      .json(sensors.get());
  });

  app.use((err, req, res, next) => {
    process.stderr.write(err.stack);
    res.status(500)
      .json({ error: err.stack });
  });

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cors());

  sensors.init();

  app.listen(PORT, () => {
    process.stdout.write(`Temperature API is listening on ${PORT}\n`);
  });
};

/* istanbul ignore next */
if (process.env.NODE_ENV !== 'test') {
  start();
}
