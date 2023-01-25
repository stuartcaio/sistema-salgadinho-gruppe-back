const express = require('express');
const Usuário = require('./src/models/Usuário');
const Empresa = require('./src/models/Empresa');
const Data = require('./src/models/Data');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser')
const moment = require('moment');
const crypto = require('crypto');
const app = express();
const porta = 8080;
require('dotenv').config();

function ehADM(req, res, next){
    let auth = req.headers.authorization;
    const token = auth && auth.split(' ')[1];
    
    if(!token){
        return res.status(401).send('Você não tem permissão para isso.');
    }
      
    try{
        const achou = jwt.verify(token, process.env.SECRET);
        
        if(achou.Permissao.includes('admin')){
            next();
        }
    } catch{
        return res.status(401).json({mensagem: 'Você não tem permissão para isso.'});
    }
}

function ehUsuario(req, res, next){
    let auth = req.headers.authorization;
    const token = auth && auth.split(' ')[1];
    
    if(!token){
        return res.status(401).send('Você não tem permissão para isso.');
    }
      
    try{
        const achou = jwt.verify(token, process.env.SECRET);

        if(achou.Permissao.includes('user')){
            next();
        }
    } catch{
        return res.status(401).json({mensagem: 'Você não tem permissão para isso.'});
    }
}

app.use(express.json());
app.use(express.urlencoded());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

function mostrarAPI(nomeURL, model, middleware, objetos){
    if(nomeURL == 'users'){
        app.get(`/${nomeURL}`, middleware, (req, res) => {
            model.findAll().then((objetos) => {
                res.status(200).send(objetos.map((objeto) => {
                    return {id: objeto.id, nome: objeto.nome, dataDeNascimento: objeto.dataDeNascimento, dataDeEmissão: objeto.dataDeEmissão}
                }));
            });
        });
    }

    app.get(`/${nomeURL}`, middleware, (req, res) => {
        model.findAll().then((objetos) => {
            res.status(200).send(objetos);
        });
    });
};

mostrarAPI('users', Usuário, ehUsuario, 'usuários');
mostrarAPI('usersADM', Usuário, ehADM, 'usuários');
mostrarAPI('empresas', Empresa, ehUsuario, 'empresas');
mostrarAPI('datas', Data, ehUsuario, 'datas');

app.get('/data/:data', ehUsuario, (req, res) => {
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

app.post('/logar', async (req, res, next) => {
    Usuário.findOne({where: {email: req.body.email}}).then(async (existe) => {
        const conferirSenha = await bcrypt.compare(req.body.senha, existe.senha);

        const contaADM = {
            email: 'caiostuart06@gmail.com',
            senha: process.env.SENHA
        }

        const refreshToken = crypto.randomBytes(24).toString('hex');
        const dataExpiracao = moment().add(5, 'd').unix();

        if(existe){
            if(!conferirSenha){
                return res.status(401).json({mensagem: 'Esta senha é da mãe do Doguinho.'})
            }

            if(existe.email == contaADM.email && bcrypt.compare(contaADM.senha, existe.senha)){
                const secretXandão = process.env.SECRET;

                existe.Permissao = [ 'admin', 'user' ];
                
                const tokenXandão = jwt.sign({
                    id: existe.id,
                    Permissao: existe.Permissao
                }, secretXandão, {expiresIn: '15min'});
                
                res.setHeader('Authorization', `Bearer ${tokenXandão}`);

                return res.status(200).json({user: existe, token: tokenXandão, refreshToken: refreshToken})
            } 
            
            if(conferirSenha && existe.email != contaADM.email && existe.senha != contaADM.senha){
                const secret = process.env.SECRET;

                existe.Permissao = [ 'user' ];

                const token = jwt.sign({
                    id: existe.id,
                    Permissao: existe.Permissao
                }, secret, {expiresIn: '15m'});

                res.setHeader('Authorization', `Bearer ${token}`);
                
                return res.status(200).json({user: existe, token: token, refreshToken: refreshToken});
            }
        } else{
            return res.status(401).json({mensagem: 'Esta senha é da mãe do Doguinho.'})
        }

        next()
    });
});

app.get('/excluir/:id', ehADM, (req, res) => {
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

app.post('/editar/:id', ehADM, (req, res) => {
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

app.post('/adicionar-salgadinho', ehADM, (req, res) => {
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

app.post('/autorizar', (req, res) => {
    Usuário.findByPk(req.body.id).then((adm) => {
        if(adm){
            adm.update({
                ADM: true
            });
        }

        console.log(req.body)

        res.setHeader('Authorization', req.body.data.token);
    });
});

app.listen(porta, () => {
    console.log(`Rodando na porta ${porta}.`);
});