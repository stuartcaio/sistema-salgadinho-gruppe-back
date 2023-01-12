const Sequelize = require('sequelize');
const db = require('../config/dbConnect');

const Data = db.define('datas-salgadinho', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    data: {
        type: Sequelize.DATE,
        allowNull: false
    },
    usuário: {
        type: Sequelize.STRING,
        allowNull: false
    },
    nomeEmpresa: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    paranoid: true,
    deletedAt: 'destroyTime'
});

module.exports = Data;