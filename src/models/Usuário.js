const Sequelize = require('sequelize');
const db = require('../config/dbConnect');

const Usuário = db.define('usuarios-salgadinho', {
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
    email: {
        type: Sequelize.STRING,
        allowNull: false
    }, 
    senha: {
        type: Sequelize.STRING,
        allowNull: false
    },
    dataDeNascimento: {
        type: Sequelize.DATE,
        allowNull: false
    },
    dataDeEmissão: {
        type: Sequelize.DATE,
        allowNull: false
    }
}, {
    paranoid: true,
    deletedAt: 'destroyTime'
});

module.exports = Usuário;