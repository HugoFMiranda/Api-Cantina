var express = require('express');
var router = express.Router();

var Reserva = require('../models/reserva');
var Prato = require('../models/pratododia');

require('dotenv').config();

/* Used to store the port and host of the external API. */
var PORTA_API = process.env.porta_API;
var HOST_API = process.env.host_API;
var URL_API = "https://" + HOST_API + ":" + PORTA_API;

/* The price of the reservation. */
var PRECO_RESERVA = 4; // €

var Client = require('node-rest-client').Client;
var client = new Client();


// GET all reservas - http://localhost:3000/reservas
router
    .get('/', function(req, res) {
        Reserva.find(function(err, reservas) {
            if (err) return next({ message: "Erro ao obter reservas", err: err });
            res.json({ message: "Reservas obtidas com sucesso", reservas: reservas });
        });
    })



// POST a reserva with data of aluno retrieved from external api using node-rest-client - http://localhost:3000/reservas
.post('/', function(req, res, next) {
    try {
        client.registerMethod("jsonMethod", URL_API + '/api/alunos/' + req.body.num_aluno, "GET");
    } catch (err) {
        return res.json({ message: 'Error', error: err });
    }

    try {
        /* A variable that is used to store the data of the student that is retrieved from the external
        API. */
        var aluno_req = null;

        /* Retrieving the student data from the external API. */
        client.registerMethod("jsonMethod", URL_API + '/api/alunos', "GET");
        client.methods.jsonMethod(function(data, response) {
            for (var j = 0; j < data.length; j++) {
                if (req.body.num_aluno == data[j].id) {
                    aluno_req = data[j];
                }
            }
            // update saldo
            if (aluno_req != null) {
                // subtract 4€ saldo of aluno retrieved from external api using node-rest-client
                var saldo = (aluno_req.saldo != null) ? aluno_req.saldo : 0;
                if (saldo < PRECO_RESERVA) {
                    return res.json({ message: 'O aluno não tem saldo uficiente para efetuar uma reserva ', saldo: aluno_req.saldo });
                } else {
                    saldo = saldo - PRECO_RESERVA;
                    client.registerMethod("jsonMethod", URL_API + '/api/alunos/' + req.body.num_aluno + '/saldo/debitar?valor=' + PRECO_RESERVA, "PUT");
                    client.methods.jsonMethod({
                        path: { "id": req.body.num_aluno },
                        headers: { "Content-Type": "application/json" },
                        data: { "id": req.body.num_aluno }
                    }, function(data, response) {
                        response.on('error', function(err) {
                            return res.json({ message: 'Error', error: err });
                        });
                        console.log("Saldo do aluno atualizado");
                    });
                }
            } else {
                return res.json({ message: 'O aluno não existe' });
            }
            // find prato in mongoDB
            var prato = Prato.findOne({
                nome: req
                    .body.prato
            }, function(err, prato) {
                if (err) return next({ message: "Erro ao obter prato", err: err });
                if (prato == null) {
                    return res.json({ message: 'O prato não existe' });
                }
                // create reserva
                var reserva = new Reserva({
                    aluno: {
                        num_aluno: req.body.num_aluno,
                        nome_aluno: aluno_req.nome,
                        email_aluno: aluno_req.email
                    },
                    pratoReservado: prato,
                    data: req.body.data,
                });
                // Saving the reservation in the database.
                reserva.save(function(err, reserva) {
                    if (err) return next({ message: "Erro ao criar reserva", err: err });
                    res.json({ message: "Reserva criada com sucesso", reserva: reserva });
                });

            });
        });
    } catch (err) {
        return res.json({ message: 'Error', error: err });
    }
});


// Get all reservas from a specific aluno - http://localhost:3000/reservas/:num_aluno
router
    .get('/:num_aluno', function(req, res, next) {
        try {
            Reserva.find({ 'aluno.num_aluno': req.params.num_aluno }, function(err, reservas) {
                if (err) return next({ message: "Erro ao obter reservas", err: err });
                if (reservas.length == 0) {
                    return res.json({ message: 'O aluno não tem reservas' });
                } else {
                    return res.json({ message: "Reservas obtidas com sucesso", num_reservas: reservas.length, reservas: reservas });
                }
            });

        } catch (err) {
            return res.json({ message: 'Error', error: err });
        }
    })


// DELETE all reservas from a specific aluno - http://localhost:3000/reservas/:num_aluno
.delete('/:num_aluno', function(req, res, next) {
    try {
        // delete many reservas of aluno
        Reserva.deleteMany({ "aluno.num_aluno": req.params.num_aluno }, function(err, reservas) {
            if (err)
                res.send(err);
            else {
                // returns money to aluno
                if (reservas.deletedCount == 0) {
                    return res.json({ message: 'O aluno não tem reservas' });
                } else {
                    var saldo_devolucao = PRECO_RESERVA * reservas.deletedCount;
                    client.registerMethod("jsonMethod", URL_API + '/api/alunos/' + req.params.num_aluno + '/saldo/creditar?valor=' + saldo_devolucao, "PUT");
                    client.methods.jsonMethod({
                            path: { "id": req.params.num_aluno },
                            headers: { "Content-Type": "application/json" },
                            data: { "id": req.params.num_aluno }
                        },
                        function(data, response) {
                            response.on('error', function(err) {
                                return res.json({ message: 'Error', error: err });
                            });
                            console.log("Saldo do aluno atualizado");
                        });


                    return res.status(200).json({ message: 'Reservas of aluno ' + req.params.num_aluno + ' deleted successfully', num_reservas: reservas.deletedCount });
                }
            }
        });
    } catch (err) {
        return res.json({ message: 'Error', error: err });
    }
})

// PUT a reserva by id - http://localhost:3000/reservas/:id
.put('/:id', function(req, res, next) {
    Reserva.findByIdAndUpdate(req.params.id, req.body, function(err, reserva) {
        if (err) return next({ message: 'No reserva found', error: err });
        return res.json({ message: 'Reserva updated successfully' });
    });
});

module.exports = router;