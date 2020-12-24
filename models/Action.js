const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ActionSchema = new Schema({
    date: String,
    action: String,
})

module.exports = mongoose.model('Action', ActionSchema);