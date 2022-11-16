var express = require('express');
var router = express.Router();

var Reserva = require('../models/reserva');

require('dotenv').config();

var porta_API = process.env.porta_API;
var host_API = process.env.host_API;
var url_API = "https://" + host_API + ":" + porta_API;

var preco_reserva = 4;

var Client = require('node-rest-client').Client;
var client = new Client();


// GET all reservas with data of aluno retrieved from external api using node-rest-client
router
    .get('/', function(req, res, next) {
        try {
            client.registerMethod("jsonMethod", url_API + '/api/alunos', "GET");
            client.methods.jsonMethod(function(data, response) {
                Reserva.find(function(err, reservas) {
                    if (reservas.length == 0) {
                        return res.json({ message: 'No reservas found' });
                    } else {
                        var reservas_alunos = [];
                        for (var i = 0; i < reservas.length; i++) {
                            if (reservas[i].aluno != null && reservas[i].aluno.num_aluno != null) {
                                for (var j = 0; j < data.length; j++) {
                                    if (reservas[i].aluno.num_aluno == data[j].id) {
                                        reservas_alunos.push({
                                            id: reservas[i].id,
                                            aluno: {
                                                num_aluno: data[j].id,
                                                nome_aluno: data[j].nome,
                                                email_aluno: data[j].email
                                            },
                                            data: reservas[i].data,
                                            pratoReservado: reservas[i].pratoReservado,
                                        });
                                    }
                                }
                            }
                        }
                        if (reservas_alunos.length == 0) {
                            return res.json({ message: 'No reservas found with alunos' });
                        } else {
                            return res.json({ message: 'Reservas with alunos retrieved successfully', reservas: reservas_alunos });
                        }
                    }
                });
            });
        } catch (err) {
            res.json({ message: 'Error', error: err });
        }
    })

// POST a reserva with data of aluno retrieved from external api using node-rest-client
.post('/', function(req, res, next) {
    try {
        client.registerMethod("jsonMethod", url_API + '/api/alunos/' + req.body.aluno.num_aluno, "GET");
    } catch (err) {
        return res.json({ message: 'Error', error: err });
    }
    var reserva = new Reserva({
        aluno: {
            num_aluno: req.body.aluno.num_aluno,
            nome_aluno: req.body.aluno.nome_aluno,
            email_aluno: req.body.aluno.email_aluno
        },
        data: req.body.data,
        pratoReservado: req.body.pratoReservado,
    });
    try {
        var alunoT = {};
        client.registerMethod("jsonMethod", url_API + '/api/alunos', "GET");
        client.methods.jsonMethod(function(data, response) {
            for (var j = 0; j < data.length; j++) {
                if (req.body.aluno.num_aluno == data[j].id) {
                    alunoT = data[j];
                }
            }
            if (alunoT != null) {
                // subtract 4€ saldo of aluno retrieved from external api using node-rest-client
                var saldo = (alunoT.saldo - preco_reserva);
                if (saldo < 0) {
                    return res.json({ message: 'O aluno não tem saldo insuficiente para efetuar uma reserva', saldo: alunoT.saldo });
                } else {
                    client.registerMethod("jsonMethod", url_API + '/api/alunos/' + req.body.aluno.num_aluno, "PUT");
                    client.methods.jsonMethod({
                        path: { "id": req.body.aluno.num_aluno },
                        headers: { "Content-Type": "application/json" },
                        data: { "id": req.body.aluno.num_aluno, "saldo": saldo, "nome": alunoT.nome, "email": alunoT.email, siglaCurso: alunoT.siglaCurso }
                    }, function(data, response) {
                        console.log("Reserva efetuada com sucesso, saldo do aluno atualizado");
                    });
                }
            } else {
                console.log("Aluno não encontrado");
            }
            return reserva.save(function(err) {
                if (err)
                    res.send(err);
                res.status(200).json({
                    message: 'Reserva efetuada com sucesso, saldo do aluno atualizado',
                    reserva: reserva
                });
            });
        });
    } catch (err) {
        return res.json({ message: 'Error', error: err });
    }
});

// Get all reservas from a specific aluno with data of aluno retrieved from external api using node-rest-client
router
    .get('/:num_aluno', function(req, res, next) {
        try {
            client.registerMethod("jsonMethod", url_API + '/api/alunos', "GET");
            client.methods.jsonMethod(function(data, response) {
                Reserva.find(function(err, reservas) {
                    if (reservas.length == 0) {
                        return res.json({ message: 'No reservas found' });
                    } else {
                        var reservas_alunos = [];
                        for (var i = 0; i < reservas.length; i++) {
                            if (reservas[i].aluno != null && reservas[i].aluno.num_aluno != null) {
                                for (var j = 0; j < data.length; j++) {
                                    if (reservas[i].aluno.num_aluno == data[j].id && reservas[i].aluno.num_aluno == req.params.num_aluno) {
                                        reservas_alunos.push({
                                            id: reservas[i].id,
                                            aluno: {
                                                num_aluno: data[j].id,
                                                nome_aluno: data[j].nome,
                                                email_aluno: data[j].email
                                            },
                                            data: reservas[i].data,
                                            pratoReservado: reservas[i].pratoReservado,
                                        });
                                    }
                                }
                            }
                        }
                        if (reservas_alunos.length == 0) {
                            return res.json({ message: 'No reservas found with alunos' });
                        } else {
                            return res.json({ message: 'Reservas with alunos retrieved successfully', reservas: reservas_alunos });
                        }
                    }
                });
            });
        } catch (err) {
            return res.json({ message: 'Error', error: err });
        }
    })


// DELETE all reservas from a specific aluno with data of aluno retrieved from external api using node-rest-client
.delete('/:num_aluno', function(req, res, next) {
    try {
        client.registerMethod("jsonMethod", url_API + '/api/alunos', "GET");
        client.methods.jsonMethod(function(data, response) {
            Reserva.find(function(err, reservas) {
                if (reservas.length == 0) {
                    return res.json({ message: 'No reservas found' });
                } else {
                    var reservas_alunos = [];
                    for (var i = 0; i < reservas.length; i++) {
                        if (reservas[i].aluno != null && reservas[i].aluno.num_aluno != null) {
                            for (var j = 0; j < data.length; j++) {
                                if (reservas[i].aluno.num_aluno == data[j].id && reservas[i].aluno.num_aluno == req.params.num_aluno) {
                                    reservas_alunos.push({
                                        id: reservas[i].id,
                                        aluno: {
                                            num_aluno: data[j].id,
                                            nome_aluno: data[j].nome,
                                            email_aluno: data[j].email
                                        },
                                        data: reservas[i].data,
                                        pratoReservado: reservas[i].pratoReservado,
                                    });
                                }
                            }
                        }
                    }
                    if (reservas_alunos.length == 0) {
                        return res.json({ message: 'No reservas found with alunos' });
                    } else {
                        for (var k = 0; k < reservas_alunos.length; k++) {
                            try {
                                Reserva.remove({
                                    _id: reservas_alunos[k].id
                                });
                            } catch (error) {
                                return res.json({ message: 'Error', error: err });
                            }
                        }
                        return res.json({ message: 'Reservas with alunos deleted successfully', reservas: reservas_alunos });
                    }
                }
            });
        });
    } catch (err) {
        return res.json({ message: 'Error', error: err });
    }
})

// PUT a reserva by id
.put('/:id', function(req, res, next) {
    rva.findByIdAndUpdate(req.params.id, req.body, function(err, reserva) {
        if (err) return next({ message: 'No reserva found', error: err });
        return res.json({ message: 'Reserva updated successfully' });
    });
});

module.exports = router;