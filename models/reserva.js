var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Pratodia = require('./pratododia').schema;

var ReservaSchema = new Schema({
    data: {
        type: Date,
        default: Date.now
    },
    pratoReservado: {
        type: Pratodia,
        ref: 'PratoDoDia'
    },
    aluno: {
        type: {
            "num_aluno": String,
            "nome_aluno": String,
            "email_aluno": String
        }
    },

});

module.exports = mongoose.model('Reserva', ReservaSchema);