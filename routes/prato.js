var express = require('express');
var router = express.Router();

var Pratodia = require('../models/pratododia');

router
// GET all pratodia - http://localhost:3000/pratodia
    .get('/', function(req, res, next) {
    Pratodia.find(function(err, pratodia) {
        if (err) return next({ message: "Erro ao obter pratos do dia", err: err });
        res.json({ message: "Pratos do dia obtidos com sucesso", pratodia: pratodia });
    });
})


// POST pratodia - http://localhost:3000/pratodia
.post('/', function(req, res, next) {
    Pratodia.create(req.body, function(err, post) {
        if (err) return next({ message: "Erro ao criar prato do dia", err: err });
        res.json({ message: "Prato do dia criado com sucesso", pratodia: post });
    });
});

// GET pratodia by id - http://localhost:3000/pratodia/:id
router
    .route('/:id')
    .get(function(req, res, next) {
        Pratodia.findById(req.params.id, function(err, post) {
            if (err) return next({ message: "Erro ao obter prato do dia", err: err });
            res.json({ message: "Prato do dia obtido com sucesso", pratodia: post });
        });
    })

// PUT pratodia - http://localhost:3000/pratodia/:id
.put(function(req, res, next) {
    Pratodia.findByIdAndUpdate(req.params.id, req.body, function(
        err,
        post
    ) {
        if (err) return next({ message: "Erro ao atualizar prato do dia", err: err });
        res.json({ message: "Prato do dia atualizado com sucesso", pratodia: post });
    });
})

// DELETE pratodia - http://localhost:3000/pratodia/:id
.delete(function(req, res, next) {
    Pratodia.findByIdAndRemove(req.params.id, req.body, function(
        err,
        post
    ) {
        if (err) return next({ message: "Erro ao remover prato do dia", err: err });
        res.json({ message: "Prato do dia removido com sucesso", pratodia: post });
    });
});

module.exports = router;