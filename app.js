// Carregando Modulos
const express    = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const mongoose   = require('mongoose')
const admin      = require('./routes/admin')
const usuarios   = require('./routes/usuarios')
const path       = require('path')
const app        = express()
const session    = require('express-session')
const flash      = require('connect-flash')
const passport   = require('passport')
const eAdmin     = require('./helpers/admin')

// Models
require('./models/Postagem')
const Postagem = mongoose.model('postagens')
require('./models/Categoria')
const Categoria = mongoose.model('categorias')

// Authenticação
require('./config/auth')(passport)

// Configurações
    // Sessão
        app.use(session({
            // Chave que gera a sessão -> pode ser uma chave aleatoria
            secret: 'blogApp',
            resave: true,
            saveUninitialized: true
        }))

        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())

    // Middleware
        app.use((req, res, next) => {
            // Cria uma Variavel global
            res.locals.success_msg = req.flash('success_msg')
            res.locals.error_msg   = req.flash('error_msg')
            res.locals.error       = req.flash('error')
            res.locals.user        = JSON.stringify(req.user) || null
            // res.locals.admin       = eAdmin || null
            // console.log(res.locals.admin)
            next()
        })

    // Body Parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())

    // Handle Bars
        app.engine('handlebars', handlebars({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars')

    // Mongoose
        mongoose.Promise = global.Promise
        mongoose.connect(
            'mongodb://localhost/blogapp',
            {useNewUrlParser: true}
        ).then(() => {
            console.log('Conectado ao MongoDB!')
        }).catch((err) => {
            console.log('Erro ao se conectar', err)
        })

    // Public
        app.use(express.static(path.join(__dirname, 'public')))


// Rotas
    // Principal
    app.get('/', (req, res) => {
        Postagem.find().populate('categoria').sort({data: 'DESC'}).lean()
        .then((postagens) => {
            res.render('index', {postagens: postagens})
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/404')
        })
    })

    // Página de Erro
    app.get('/404', (req, res) => {
        res.send('Erro 404!')
    })

    // Rotas de Admin
    app.use('/admin', admin)

    // Rotas de Usuários
    app.use('/usuarios', usuarios)

    // Rota responsável por chamar a página da Postagem
    app.get('/postagem/:slug', (req, res) => {
        // Reliza a busca da Postagem
        Postagem.findOne({slug: req.params.slug}).lean()
        .then((postagem) => {
            // Verifica se encontrou a mensagem
            if (postagem) {
                // Chama a página visualzação de Postagem
                res.render('postagem/index', {postagem: postagem})
            } else {
                // Em caso de erro
                req.flash('error_msg', 'Esta postagem não existe!')
                res.redirect('/')
            }
        }).catch((err) => {
            console.log('Erro ao encontrar postagem, tente novamente', err)
            // Em caso de erro
            req.flash('error_msg', 'Erro ao encontrar postagem, tente novamente')
            res.redirect('/')
        })
    })

    // Rota responsável por chamar a página de listagem de categorias
    app.get('/categorias', (req, res) => {
        // Realiza a busca de Categorias
        Categoria.find().lean()
        .then((categorias) => {
            // Chama a página de Categorias
            res.render('categorias/index', {categorias: categorias})
        }).catch((err) => {
            // Exibe o erro e redireciona á página principal
            req.flash('error_msg', 'Houve um erro interno ao buscar as Categorias')
            res.redirect('/')
        })
    })

    // Rota responsável pela busca de Postagem por Categoria (filtro)
    app.get('/categorias/:slug', (req, res) => {
        Categoria.findOne({slug: req.params.slug}).lean()
        .then((categoria) => {
            // Verifica se a Categoria foi encontrada
            if (categoria) {
                // Pesquisa todas as postagens que possuem essa categoria
                Postagem.find({categoria: categoria._id}).lean()
                .then((postagens) => {
                    // Chama a página que irá Listar as Postagens da Categoria selecionada
                    res.render('categorias/postagens', {
                        postagens: postagens, 
                        categoria: categoria
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro ao listar as Postagens')
                    req.redirect('/')
                })
            } else {
                req.flash('error_msg', 'Esta categoria não existe!')
                res.redirect('/')
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno ao carregar a Categoria!')
            res.redirect('/')
        })
    })


// Outros
    const PORT = 8081
    app.listen(PORT, () => {
        console.log('Servidor rodando! ✔')
    })