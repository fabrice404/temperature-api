const mongoose = require('mongoose'),
    measure = new mongoose.Schema({
        id: Number,
        name: String,
        measure: Number,
        date: {
            type: Date,
            default: Date.now
        }
    });
module.exports = mongoose.model('Measure', measure);
