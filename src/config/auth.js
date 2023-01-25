module.exports = {
    ehADM: async function (req, res, next) => {
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
    },
    ehUsuario: async (req, res, next) => {
        let auth = req.headers.authorization;
        const token = auth && auth.split(' ')[1];
        
        if(!token){
            return res.status(401).send('Você não tem permissão para isso.');
        }
        
        try{
            const achou = jwt.verify(token, process.env.SECRET);

            if(achou.Permissao.includes('user')){
                next();
            } else{
            }
        } catch{
            return res.status(401).json({mensagem: 'Você não tem permissão para isso.'});
        }
    }
}