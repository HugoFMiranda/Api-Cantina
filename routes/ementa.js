var express = require('express');
var router = express.Router();

var Ementasemana = require('../models/ementasemana');

router
// GET all ementasemana
    .get('/', function(req, res, next) {
    Ementasemana.find(function(err, ementasemana) {
        if (err) return next({ message: "Erro ao obter ementas da semana", err: err });
        res.json({ message: "Ementas da semana obtidas com sucesso", ementasemana: ementasemana });
    });
})



// POST ementasemana
.post('/', function(req, res, next) {
    Ementasemana.create(req.body, function(err, post) {
        if (err) {
            return next({ message: "Erro ao criar ementa", err: err });
        } else
            res.json({ message: "Ementa criada com sucesso", ementasemana: post });
    });
});

// GET ementasemana by id
router
    .route('/:id')
    .get(function(req, res, next) {
        Ementasemana.findById(req.params.id, function(err, post) {
            if (err) return next({ message: "Erro ao obter ementa", err: err });
            res.json({ message: "Ementa obtida com sucesso", ementasemana: post });
        });
    })

// PUT ementasemana
.put(function(req, res, next) {
    Ementasemana.findByIdAndUpdate(req.params.id, req.body, function(
        err,
        post
    ) {
        if (err) return next({ message: "Erro ao atualizar ementa", err: err });
        res.json({ message: "Ementa atualizada com sucesso", ementasemana: post });
    });
})

// DELETE ementasemana
.delete(function(req, res, next) {
    Ementasemana.findByIdAndRemove(req.params.id, req.body, function(
        err,
        post
    ) {
        if (err) return next({ message: "Erro ao remover ementa", err: err });
        res.json({ message: "Ementa removida com sucesso", ementasemana: post });
    });
});

module.exports = router;