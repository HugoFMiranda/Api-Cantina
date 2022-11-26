var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Pratodia = require('./pratododia').schema;

var EmentaSemanaSchema = new Schema({
    id: {
        type: Schema.Types.ObjectId
    },
    data: {
        type: Date,
        required: true,
        default: Date.now
    },
    listaPratos: [{
        type: Pratodia,
        ref: 'PratoDoDia'
    }],
});
module.exports = mongoose.model('EmentaSemana', EmentaSemanaSchema);