var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PratoDoDiaSchema = new Schema({
    id: {
        type: Schema.Types.ObjectId
    },
    nome_prato: {
        type: String,
        required: true
    },
    dia_prato: {
        type: String,
        required: true
    },
});
module.exports = mongoose.model('PratoDoDia', PratoDoDiaSchema);