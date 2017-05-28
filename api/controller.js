const config = require('../config'),
    mongoose = require('mongoose'),
    measure = mongoose.model('Measure');

const readTemperature = sensorId => {
    return new Promise((resolve, reject) => {
        measure.findOne({
            'id': sensorId
        }, (err, result) => {
            if (err)
                reject(error);
            resolve(result);
        }).sort({
            date: -1
        })
    });
}

exports.read = (req, res) => {
    readTemperature(req.params.sensorId)
        .then(result => res.json(result))
        .catch(error => res.send(error));
}

exports.readAll = (req, res) => {
    Promise.all(config.sensors.map(sensor => readTemperature(sensor.id)))
        .then(result => res.json(result))
        .catch(error => res.send(error));
}
