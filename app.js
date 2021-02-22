// Carregando Modulos
const express    = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const mongoose   = require('mongoose')
const admin      = require('./routes/admin')
const path       = require('path')
const app        = express()
const session    = require('express-session')
const flash      = require('connect-flash')

// Models
require('./models/Postagem')
const Postagem = mongoose.model('postagens')

// Configurações
    // Sessão
        app.use(session({
            // Chave que gera a sessão -> pode ser uma chave aleatoria
            secret: 'blogApp',
            resave: true,
            saveUninitialized: true
        }))

        app.use(flash())

    // Middleware
        app.use((req, res, next) => {
            // Cria uma Variavel global
            res.locals.success_msg = req.flash('success_msg')
            res.locals.error_msg   = req.flash('error_msg')
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

    // Admin
    app.use('/admin', admin)


// Outros
    const PORT = 8081
    app.listen(PORT, () => {
        console.log('Servidor rodando! ✔')
    })