var express = require('express');
var router = express.Router();
var novedadesModel = require('./../models/novedadesModel');
var recetasModel = require('./../models/recetasModel');
var usuariosModel = require('./../models/usuariosModel');
var cloudinary = require('cloudinary').v2;
var nodemailer  = require('nodemailer');


router.post('/admin/login', async function (req, res, next) {
    try {
        const { usuario, password } = req.body;
        let user = await usuariosModel.getUserByUsernameAndPassword(usuario, password);
        if (user) {
            res.json({ success: true, user: { id: user.id, nombre: user.usuario } });
        } else {
            res.status(401).json({ success: false, message: 'Usuario y/o contraseña incorrectos.' });
        }

    } catch (error) {
        console.error("Error en la ruta de login:", error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
})

router.get('/novedades', async function (req, res, next) {
    let novedades = await novedadesModel.getNovedades();
    novedades = novedades.map(novedades => {
        if (novedades.img_id) {
            const imagen = cloudinary.url(novedades.img_id, {
                width: 960,
                height: 200,
                crop: 'fill'
            })
            return { ...novedades, imagen }
        } else {
            return { ...novedades, imagen: '' }
        }
    })
    res.json(novedades)
})

router.get('/recetas', async function (req, res, next) {
    let recetas = await recetasModel.getRecetas();
    recetas = recetas.map(recetas => {
        if (recetas.img_id) {
            const imagen = cloudinary.url(recetas.img_id, {
                width: 960,
                height: 200,
                crop: 'fill'
            })
            return { ...recetas, imagen }
        } else {
            return { ...recetas, imagen: '' }
        }
    })
    res.json(recetas)
})

router.get('/recetas', async function (req, res, next) {
    let recetas = await recetasModel.getRecetas();
    recetas = recetas.map(recetas => {
        if (recetas.img_id) {
            const imagen = cloudinary.url(recetas.img_id, {
                width: 960,
                height: 200,
                crop: 'fill'
            })
            return { ...recetas, imagen }
        } else {
            return { ...recetas, imagen: '' }
        }
    })
    res.json(recetas)
})

router.get('/recetas/:id', async function (req, res, next) {
    console.log('req', req.params);
    let recetas = await recetasModel.getRecetasByUserId(req.params.id);
    recetas = recetas.map(recetas => {
        if (recetas.img_id) {
            const imagen = cloudinary.url(recetas.img_id, {
                width: 960,
                height: 200,
                crop: 'fill'
            })
            return { ...recetas, imagen }
        } else {
            return { ...recetas, imagen: '' }
        }
    })
    res.json(recetas)
})

router.post('/contacto', async (req, res) => {
    const mail = {
        to: 'flavia.ursino@gmail.com',
        subject: 'Contacto web',
        html: `${req.body.nombre} se contacto a traves de la web y quiere más informacion a este correo: ${req.body.email}<br> Además, hizo el siguiente comentario: ${req.body.mensaje} <br> Su tel es: ${req.body.telefono}`
    }

    const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    await transport.sendMail(mail)

    res.status(201).json({
        error: false,
        message: 'Mensaje enviado'
    });
});

module.exports = router;