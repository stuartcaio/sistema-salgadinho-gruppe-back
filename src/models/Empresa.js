const Sequelize = require('sequelize');
const db = require('../config/dbConnect');

const Empresa = db.define('empresas-salgadinho', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    nome: {
        type: Sequelize.STRING,
        allowNull: false
    },
    imagem: {
        type: Sequelize.STRING,
        allowNull: false
    },
    contato: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    paranoid: true,
    deletedAt: 'destroyTime'
});

module.exports = Empresa;