const config = require('../config'),
    cron = require('node-cron'),
    request = require('request'),
    mongoose = require('mongoose'),
    measure = require('../api/model');

mongoose.Promise = global.Promise;
mongoose.connect(config.mongo.connectionString);

const getTemperature = sensor => request(sensor.url, (error, response, body) => {
    let temperature = new measure({
        id: sensor.id,
        name: sensor.name,
        measure: body.trim()
    })
    temperature.save(error => {
        if (error) {
            console.error(error);
        }
    })
});

const getTemperatures = () => config.sensors.map(sensor => getTemperature(sensor));

// read temperatures every 5 minutes
cron.schedule(config.cron, () => getTemperatures());
