var express = require('express');
var router = express.Router();
var recetasModel = require('../../models/recetasModel')
var hbs = require('hbs');
var util = require('util');
var cloudinary = require('cloudinary').v2;

const uploader = util.promisify(cloudinary.uploader.upload);
const destroy = util.promisify(cloudinary.uploader.destroy);

hbs.registerHelper('isActive', function (actualUrl, expectedUrl) {
    return actualUrl === expectedUrl ? 'activo' : '';
});

router.get('/', async function (req, res, next) {
    var recetas = await recetasModel.getRecetas();
    
    recetas = recetas.map(receta => {
        if (receta.img_id) {
        const imagen = cloudinary.image(receta.img_id, {
            width: 100,
            height: 100,
            crop: 'fill'
        })
        return {...receta, imagen}
        } else {
        return {...receta, imagen: ''}
        }
    })

    res.render('admin/recetas', {
        layout: 'admin/layout',
        usuario: req.session.nombre,
        url: 'admin/recetas',
        recetas,
        admin: req.session.id_usuario === 1
    })
});

router.get('/agregar', (req, res, next) => {
    res.render('admin/recetas/agregar', {
        layout: 'admin/layout',
        usuario: req.session.nombre,
        admin: req.session.id_usuario === 1
    })
});

router.post('/agregar', async (req, res, next) => {
    try {
        var img_id = '';
        if (req.files && Object.keys(req.files).length > 0) {
            imagen = req.files.imagen;
            img_id = (await uploader(imagen.tempFilePath)).public_id;
        }
        if (req.body.titulo != "" && req.body.descripcion != "" && req.body.instrucciones != "" && req.body.tiempo != "" && req.body.categoria != "") {
            var obj = {
                titulo: req.body.titulo,
                descripcion: req.body.descripcion,
                ingredientes: JSON.stringify(JSON.parse(req.body.ingredientes)),
                instrucciones: req.body.instrucciones,
                tiempo: req.body.tiempo,
                categoria: req.body.categoria,
                id_usuario: req.session.id_usuario,
                fecha_creacion: new Date()
            }
            
            await recetasModel.insertReceta({...obj, img_id});
            res.redirect('/admin/recetas');
        } else {
            res.render('admin/recetas/agregar', {
                layout: 'admin/layout',
                error: true,
                message: 'Todos los campos (Título, Descripción, Instrucciones, Tiempo y Categoría) son requeridos.'
            });
        }
    } catch (error) {
        console.error(error);
        res.render('admin/recetas/agregar', {
            layout: 'admin/layout',
            error: true,
            message: 'No se cargó la receta. Error: ' + error.message
        });
    }
});

router.get('/modificar/:id', async (req, res, next) => {
    let id = req.params.id;
    let receta = await recetasModel.getRecetaById(id);
    if (receta.ingredientes && typeof receta.ingredientes === 'object') {
        receta.ingredientes = JSON.stringify(receta.ingredientes, null, 2);
    }
    res.render('admin/recetas/modificar', {
        layout: 'admin/layout',
        receta,
        usuario: req.session.nombre,
        admin: req.session.id_usuario === 1
    })
});

router.post('/modificar', async (req, res, next) => {
    try {
        let img_id = req.body.img_original;
        let borrar_img_vieja = false;
        if (req.body.img_delete === '1') {
            img_id = null;
            borrar_img_vieja = true;
        } else {
            if (req.files && Object.keys(req.files).length > 0) {
                imagen = req.files.imagen;
                img_id = (await uploader(imagen.tempFilePath)).public_id;
                borrar_img_vieja = true;
            }
        }
        if (borrar_img_vieja && req.body.img_original) {
            await (destroy(req.body.img_original));
        }
        var obj = {
            titulo: req.body.titulo,
            descripcion: req.body.descripcion,
            ingredientes: req.body.ingredientes, 
            instrucciones: req.body.instrucciones,
            tiempo: req.body.tiempo,
            categoria: req.body.categoria,
            img_id
        }
        await recetasModel.modificarRecetaById(obj, req.body.id);
        res.redirect('/admin/recetas');
    } catch (error) {
        console.error(error);
        res.render('admin/recetas/modificar', {
            layout: 'admin/layout',
            error: true,
            message: 'No se modificó la receta. Error: ' + error.message
        });
    }
});

router.get('/eliminar/:id', async (req, res, next) => {
    var id = req.params.id;
    let receta = await recetasModel.getRecetaById(id);
    if (receta.img_id) await (destroy(receta.img_id));
    await recetasModel.deleteRecetaById(id);
    res.redirect('/admin/recetas')
});

module.exports = router;