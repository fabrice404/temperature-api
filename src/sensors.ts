import axios from 'axios';
import { mkdir, writeFile } from 'fs';
import nodeCron from 'node-cron';
import { homedir } from 'os';
import pProps from 'p-props';
import { promisify } from 'util';

import configJson from './config.json';

let readings = {};
let cronActive = false;

export const getReadings = (): object => readings;
export const isCronActive = (): boolean => cronActive;

export const init = async () => {
  // set readings
  readings = {};
  Object.keys(configJson).forEach((id) => { readings[id] = []; });

  // activate cron
  if (!cronActive) {
    nodeCron.schedule('*/1 * * * *', readSensors); // every 5 minutes
    nodeCron.schedule('0 0 * * *', save); // midnight every day
    cronActive = true;

    await readSensors();
  }

};

export const readSensors = async () => {
  const promises = {};
  Object.keys(configJson)
    .forEach((id) => {
      const { url } = configJson[id];
      promises[id] = axios.get(url);
    });

  const results = await pProps(promises);
  Object.keys(results)
    .forEach((id) => {
      const result = results[id];
      const value = Math.round(result.data * 10) / 10;
      const now = new Date().toISOString();
      const previous = readings[id].slice(-1)[0];
      if (previous && previous.value === value) {
        previous.to = now;
      } else {
        readings[id].push({ value, from: now, to: now });
      }
    });
};

export const save = async () => {
  const folder = `${homedir()}/log/temperature-api`;
  await promisify(mkdir)(folder, { recursive: true });

  const filename = `${folder}/${new Date().toISOString().replace(/[^0-9]/gi, '')}.json`;
  await promisify(writeFile)(filename, JSON.stringify(readings, null, 2));

  process.stdout.write(`Log saved: ${filename}\n`);
};

export const get = (id?: string) => {
  const result = {};
  Object.keys(configJson)
    .filter(sensorId => id == null || sensorId === id)
    .forEach((sensorId) => {
      const { name } = configJson[sensorId];
      result[name] = readings[sensorId].slice(-1)[0];
    });

  return result;
};
