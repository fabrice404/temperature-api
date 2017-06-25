module.exports = app => {
  const sensor = require('./controller')

  app.route('/sensors')
    .get(sensor.readAll);

  app.route('/sensor/:sensorId')
    .get(sensor.read);
};
