const express = require('express');
const Usuário = require('./src/models/Usuário');
const Empresa = require('./src/models/Empresa');
const Data = require('./src/models/Data');
require('dotenv').config();
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const porta = 8080;

app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

function mostrarAPI(nomeURL, model, objetos){
    app.get(`/${nomeURL}`, (req, res) => {
        model.findAll().then((objetos) => {
            res.status(200).send(objetos);
        });
    });
};

mostrarAPI('users', Usuário, 'usuários');
mostrarAPI('empresas', Empresa, 'empresas');
mostrarAPI('datas', Data, 'datas');

app.get('/data/:data', (req, res) => {
    Data.findOne({where: req.body.data}).then((data) => {
        res.status(200).send(data)
    });
});

app.post('/registrar', async (req, res) => {
    const salt = await bcrypt.genSalt(12);
    const senhaHash = await bcrypt.hash(req.body.senha, salt)

    Usuário.findOne({where: {email: req.body.email}}).then((existe) => {
        if(existe){
            console.log('Esse e-mail já existe.');
        } else{
            Usuário.create({
                nome: req.body.nome,
                email: req.body.email,
                senha: senhaHash,
                dataDeNascimento: req.body.dataDeNascimento,
                dataDeEmissão: req.body.dataDeEmissão
            }).then(() => {
                res.redirect('http://localhost:3000/sistema');
            }).catch(() => {
                console.log('Houve um erro ao cadastrar o usuário.');
            });
        }
    });
});

app.post('/logar', async (req, res) => {
    Usuário.findOne({where: {email: req.body.email}}).then(async (existe) => {
        const conferirSenha = await bcrypt.compare(req.body.senha, existe.senha);

        if(existe){
            if(!conferirSenha){
                return res.status(401).json({mensagem: 'Esta senha é da mãe do Doguinho.'})
            } else{
                if(existe.nome == 'Caio Weber Stuart' && existe.email == 'caiostuart06@gmail.com' && existe.senha == process.env.SENHASISTEMA){
                    const secretXandão = process.env.SECRETXANDAO;

                    const tokenXandão = jwt.sign({
                        id: existe.id
                    }, secretXandão);

                    return res.status(200).json({user: existe, tokenXandão: tokenXandão})
                }

                const secret = process.env.SECRET;

                const token = jwt.sign({
                    id: existe.id
                }, secret);
                
                return res.status(200).json({user: existe, token: token});
            }
        } else{
            return res.status(401).json({mensagem: 'Esta senha é da mãe do Doguinho.'})
        }
    });
});

app.get('/excluir/:id', (req, res) => {
    Usuário.findByPk(req.params.id).then((usuário) => {
        if(usuário){
            usuário.destroy({
                where: {id: req.params.id}
            }).then(() => {
                res.json({mensagem: 'Usuário removido com sucesso.'});
            });
        }
    });
});

app.post('/editar/:id', (req, res) => {
    Usuário.findByPk(req.params.id).then((usuário) => {
        if(usuário){
            usuário.update({
                nome: req.body.nome,
                senha: req.body.senha,
                dataDeNascimento: req.body.dataDeNascimento,
                dataDeEmissão: req.body.dataDeEmissão
            }).then(() => {
                res.redirect('http://localhost:3000/usuários-admin');
            });
        }
    });
});

app.post('/adicionar-salgadinho', (req, res) => {
    Empresa.findOne({where: {nome: req.body.nome}}).then((existe) => {
        if(existe){
            Data.findOne({where: {data: req.body.data}}).then((dataExiste) => {
                if(dataExiste){
                    res.send('Esta data já existe');
                } else{
                    Data.create({data: req.body.data, nomeEmpresa: req.body.nome, usuário: req.body.nomeUsuário}).then(() => {
                        res.redirect('http://localhost:3000/Agenda')
                    });
                }
            });
        }
    });
});

app.listen(porta, () => {
    console.log(`Rodando na porta ${porta}.`);
});