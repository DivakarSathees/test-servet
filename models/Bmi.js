const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BmiSchema = new Schema({
    userId: String,
    height: Number,
    weight: Number
    // expiresAt: Date
})

const Bmi = mongoose.model('Bmi', BmiSchema)

module.exports = Bmi;