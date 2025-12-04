var express = require('express');
var router = express.Router();
var usuariosModel = require('../../models/usuariosModel')

router.get('/', function(req, res, next) {
  res.render('admin/login', {
    layout: 'admin/layout',
    error: false
  })
});

router.post('/', async (req, res, next) => {
  try {
    var usuario = req.body.usuario;
    var password = req.body.password;
    var data = await usuariosModel.getUserByUsernameAndPassword(usuario, password);
    if (data != undefined) {
      req.session.id_usuario = data.id ?? null;
      req.session.nombre = data.usuario ?? null;
      res.redirect(data.id === 1 ? '/admin/novedades' : '/recetas')
    } else {
      req.session.id_usuario = null;
      req.session.nombre = null;
      res.render('admin/login', {
        layout: 'admin/layout',
        error: true
      })
    }
  } catch (error) {
    console.log(error);
  }
})


router.get('/logout', function (req, res, next) {
  req.session.destroy()
  res.render('admin/login', {
    layout: 'admin/layout'
  })
});

module.exports = router;
