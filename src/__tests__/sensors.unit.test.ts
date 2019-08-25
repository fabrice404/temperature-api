import axios from 'axios';
import { mkdir, writeFile } from 'fs';
import nodeCron from 'node-cron';

import * as sensors from '../sensors';

jest.mock('axios', () => ({
  get: jest.fn((url) => {
    return Promise.resolve({ data: url === 'http://sensor.1/gettemp' ? 20 : Math.random() * 40 });
  }),
}));

jest.mock('fs', () => ({
  mkdir: jest.fn((dir, opts, cb) => cb()),
  writeFile: jest.fn((file, content, cb) => cb()),
}));

jest.mock('node-cron', () => ({
  schedule: jest.fn((time, cb) => cb()),
}));

jest.mock('os', () => ({
  homedir: jest.fn(() => '/tmp'),
}));

jest.mock('../config.json', () => ({
  1: {
    name: '1',
    url: 'http://sensor.1/gettemp',
  },
  2: {
    name: '2',
    url: 'http://sensor.2/gettemp',
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('sensors', () => {
  describe('getReadings', () => {
    it('should return the current readings', () => {
      const result = sensors.getReadings();
      expect(result).toEqual(expect.any(Object));
    });
  });

  describe('isCronActive', () => {
    it('should return state of cron', () => {
      const result = sensors.isCronActive();
      expect(result).toEqual(expect.any(Boolean));
    });
  });

  describe('init', () => {
    it('should initialise the crons', async () => {
      expect(sensors.isCronActive()).toEqual(false);

      await sensors.init();
      expect(nodeCron.schedule).toHaveBeenCalledTimes(2);

      expect(sensors.isCronActive()).toEqual(true);
    });

    it('should not reinitialise the crons if already initialised', async () => {
      expect(sensors.isCronActive()).toEqual(true);

      await sensors.init();
      expect(nodeCron.schedule).toHaveBeenCalledTimes(0);

      expect(sensors.isCronActive()).toEqual(true);
    });
  });

  describe('readSensors', () => {
    it('should call all sensors and add result to the readings', async () => {
      const before = JSON.parse(JSON.stringify(sensors.getReadings()));
      await sensors.readSensors();
      const after = { ...sensors.getReadings() };

      expect(axios.get).toHaveBeenCalledTimes(Object.keys(before).length);

      Object.keys(before)
        .forEach((sensorId) => {
          expect(before[sensorId]).not.toEqual(after[sensorId]);
          expect(before[sensorId].length).toBeLessThanOrEqual(after[sensorId].length);
        });
    });
  });

  describe('save', () => {
    it('should create the log folder and save the file', async () => {
      await sensors.save();

      expect(mkdir).toHaveBeenCalledWith(
        '/tmp/log/temperature-api',
        { recursive: true },
        expect.any(Function),
      );

      expect(writeFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(Function),
      );
    });
  });

  describe('get', () => {
    it('should return all sensors values', () => {
      const result = sensors.get();
      expect(result).toMatchObject({
        1: {
          value: expect.any(Number),
          from: expect.any(String),
          to: expect.any(String),
        },
        2: {
          value: expect.any(Number),
          from: expect.any(String),
          to: expect.any(String),
        },
      });
    });
    it('should value for specified sensor', () => {
      const result = sensors.get('2');
      expect(result).toMatchObject({
        2: {
          value: expect.any(Number),
          from: expect.any(String),
          to: expect.any(String),
        },
      });
    });
    it('should return an empty object for unknown sensor', () => {
      const result = sensors.get('3');
      expect(result).toEqual({});
    });
  });
});
