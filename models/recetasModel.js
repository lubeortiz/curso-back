var pool = require('./bd');

async function getRecetas() {
    var query = "select * from recetas order by id desc";
    var rows = await pool.query(query);
    return rows;
}

async function insertReceta(obj) {
    try {
        var query = "insert into recetas set ? ";
        var rows = await pool.query(query, [obj]);
        return rows;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function getRecetaById(id) {
    var query = "select * from recetas where id = ?";
    var rows = await pool.query(query, [id]);
    return rows[0];
}

async function getRecetasByUserId(id_usuario) {
    console.log('id_usuario', id_usuario);
    var query = "select * from recetas where id_usuario = ? order by id desc";
    var rows = await pool.query(query, [id_usuario]);
    return rows;
}

async function modificarRecetaById(obj, id) {
    try {
        var query = "update recetas set ? where id=?";
        var rows = await pool.query(query, [obj, id]);
        return rows;
    } catch (error) {
        throw error;
    }
}

async function deleteRecetaById(id) {
    var query = "delete from recetas where id = ?";
    var rows = await pool.query(query, [id]);
    return rows;
}

module.exports = {getRecetas, insertReceta, getRecetaById, modificarRecetaById, deleteRecetaById, getRecetasByUserId}