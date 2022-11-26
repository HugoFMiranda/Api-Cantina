var express = require('express');
var router = express.Router();

var Ementasemana = require('../models/ementasemana');
var Pratodia = require('../models/pratododia');


router
// GET all ementasemana - http://localhost:3000/api/ementa
    .get('/', function(req, res, next) {
    Ementasemana.find(function(err, ementasemana) {
        if (err) return next({ message: "Erro ao obter ementas da semana", err: err });
        res.json({ message: "Ementas da semana obtidas com sucesso", ementasemana: ementasemana });
    });
})

// POST ementasemana - http://localhost:3000/api/ementa
.post('/', function(req, res, next) {

    var ids_pratos = req.body.ids_pratos;
    if (ids_pratos != null) {
        var ementasemana = new Ementasemana();
        try {
            Pratodia.find({ _id: { $in: ids_pratos } }, function(err, pratos) {
                if (err) return next({ message: "Erro ao obter pratos", err: err });
                if (pratos.length != ids_pratos.length || pratos == null) return next({ message: "Erro ao obter pratos", err: err });
                ementasemana = new Ementasemana({
                    data: req.body.data,
                    listaPratos: pratos
                });
            });
        } catch (err) {
            return next({ message: "Erro ao obter pratos", err: err });
        }

        try {
            ementasemana.save(function(err) {
                if (err) return next({ message: "Erro ao criar ementa da semana", err: err });
                return res.status(200).json({ message: "Ementa da semana criada com sucesso", ementasemana: ementasemana });
            });
        } catch (error) {
            return next({ message: "Erro ao criar ementa da semana", err: err });
        }
    } else {
        Ementasemana.create(req.body, function(err, post) {
            if (err) {
                return next({ message: "Erro ao criar ementa", err: err });
            } else
                res.json({ message: "Ementa criada com sucesso", ementasemana: post });
        });
    }

});

// GET ementasemana by id - http://localhost:3000/api/ementa/:id
router
    .route('/:id')
    .get(function(req, res, next) {
        Ementasemana.findById(req.params.id, function(err, post) {
            if (err) return next({ message: "Erro ao obter ementa", err: err });
            res.json({ message: "Ementa obtida com sucesso", ementasemana: post });
        });
    })

// PUT ementasemana - http://localhost:3000/api/ementa/:id
.put(function(req, res, next) {
    Ementasemana.findByIdAndUpdate(req.params.id, req.body, function(
        err,
        post
    ) {
        if (err) return next({ message: "Erro ao atualizar ementa", err: err });
        res.json({ message: "Ementa atualizada com sucesso", ementasemana: post });
    });
})

// DELETE ementasemana - http://localhost:3000/api/ementa/:id
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