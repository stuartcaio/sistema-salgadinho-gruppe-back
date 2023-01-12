const Sequelize = require('sequelize');
require('dotenv').config();

const senha = process.env.SENHA;

const sequelize = new Sequelize("usuarios-salgadinho", "root", senha, {
    host: "localhost",
    dialect: "mysql"
});

sequelize.authenticate().then(function(){
    console.log('Conexão com o banco de dados feita com sucesso.');
}).catch(function(){
    console.log('Erro: Não foi possível conectar com o banco de dados.');
});

module.exports = sequelize;