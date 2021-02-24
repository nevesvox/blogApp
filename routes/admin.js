// Importa o Express
const express  = require('express')
const router   = express.Router()
const mongoose = require('mongoose')

// Models
require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')

// Helpers
const {admin} = require('../helpers/admin')

// Rotas
    // Rota principal
    router.get('/', admin, (req, res) => {
        res.render('admin/index')
    })

    router.get('/posts', admin, (req, res) => {
        res.send('Página de posts')
    })

    // Rota responsável por chamar a página de 'Categorias'
    router.get('/categorias', admin, (req, res) => {
        // Realiza a busca das categorias
        Categoria.find().sort({date: 'DESC'}).lean()
        .then((categorias) => {
            // Renderiza a página passando o retorno da busca
            res.render('admin/categorias', {categorias: categorias})
        }).catch((err) => {
            console.log('Houve um erro ao listar as categorias', err)
            // Atualiza a variavel com a msg -> variavel flash ela se limpam automaticamente
            req.flash('error_msg', 'Houve um erro ao listar as categorias')
            // Direciona para a página Admin
            res.redirect('/admin')
        })
    })

    // Rota responsável por chamar a página de 'Nova Categoria'
    router.get('/categorias/add', admin, (req, res) => {
        res.render('admin/addCategoria')
    })

    // Rota responsável por inserir uma nova categoria no DB
    router.post('/categorias/nova', admin, (req, res) => {

        // Validação do formulário
        var erros = []

        if (!req.body.nome || typeof req.body.nome === undefined || req.body.nome == null) {
            erros.push({texto: 'Nome inválido!'})
        }

        if (!req.body.slug || typeof req.body.slug === undefined || req.body.slug == null) {
            erros.push({texto: 'Slug inválido!'})
        }

        if (req.body.nome.length < 2) {
            erros.push({texto: 'O Nome da categoria é muito pequeno!'})
        }

        // Verifica se possui erros
        if (erros.length > 0) {
            // Renderiza a página novamente passando o array de erros
            res.render(
                'admin/addCategoria', 
                { erros: erros }
            )
        
        // Caso não haja erros
        } else {
            // Cria obeto de categoria
            const novaCategoria = {
                nome: req.body.nome,
                slug: req.body.slug
            }
    
            // Insere uma nova Categoria no DB
            new Categoria(novaCategoria).save()
            .then(() => {
                console.log('Categoria salva com sucesso')
                // Atualiza a variavel com a msg -> variavel flash ela se limpam automaticamente
                req.flash('success_msg', 'Categoria criada com sucesso!')
                // Redireciona para a página de categorias
                res.redirect('/admin/categorias')
            }).catch((err) => {
                console.log('Erro ao salvar categoria.', err)
                // Atualiza a variavel com a msg -> variavel flash ela se limpam automaticamente
                req.flash('error_msg', 'Houve um erro ao salvar a categoria, tente novamente!')
                res.redirect('/admin')
            })
        }

    })

    // Rota responsavel por chamar a página de edição de Categoria
    router.get('/categorias/edit/:id', admin, (req, res) => {
        // Procura o registro pelo id
        Categoria.findOne({_id: req.params.id}).lean()
        .then((categoria) => {
            console.log('Categoria encontrada no DB!')
            res.render('admin/editCategoria', {categoria: categoria})
        }).catch((err) => {
            console.log('Erro ao buscar categoria', err)
            req.flash('error_msg', 'Esta categoria não existe!')
            res.redirect('/admin/categorias')
        })
    })

    // Rota responsável pela edição da Categoria no DB
    router.post('/categorias/edit', admin, (req, res) => {
        Categoria.findOne({_id: req.body.id})
        .then((categoria) => {
            // Atualiza os dados do registro
            categoria.nome = req.body.nome
            categoria.slug = req.body.slug

            // Salva os dados atualizados
            categoria.save()
            .then(() => {
                req.flash('success_msg', 'Categoria editada com Sucesso!')
                res.redirect('/admin/categorias')
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao salvar a edição da Categoria!')
                res.redirect('/admin/categorias')
            })

        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao editar a Categoria')
            res.redirect('/admin/categorias')
        })
    })

    // Rota responsável pela exclusão da Categoria no DB
    router.post('/categorias/deleteCategoria', admin, (req, res) => {
        // Remove a categoria do DB
        Categoria.deleteOne({_id: req.body.id})
        .then(() => {
            req.flash('success_msg', 'Categoria excluida com sucesso!')
            res.redirect('/admin/categorias')
        }).catch((err) => {
            console.log('Erro ao excluir Categoria!', err)
            req.flash('error_msg', 'Erro ao excluir Categoria!')
            res.redirect('/admin/categorias')
        })
    })

    // Rota responsável por abrir a página de Lista de Postagens
    router.get('/postagens', admin, (req, res) => {
        // Realiza a busca das Postagens
        Postagem.find().populate('categoria').sort({date: 'DESC'}).lean()
        .then((postagens) => {
            // Renderiza a página passando o retorno da busca
            res.render('admin/postagens', {postagens: postagens})
        }).catch((err) => {
            console.log('Houve um erro ao listar as Postagens', err)
            // Atualiza a variavel com a msg -> variavel flash ela se limpam automaticamente
            req.flash('error_msg', 'Houve um erro ao listar as Postagens')
            // Direciona para a página Admin
            res.redirect('/admin')
        })
    })

    router.get('/postagens/add', admin, (req, res) => {
        // Busca as categorias
        Categoria.find().lean()
        .then((categorias) => {
            // Chama a página de adição de Postagens
            res.render('admin/addPostagem', {categorias: categorias})
        }).catch((err) => {
            console.log('Erro ao carregar o formulário!', err)
            // Exibe o erro
            req.flash('error_msg', 'Erro ao carregar o formulário!')
            res.redirect('/admin/postagens')
        })
    })

    // Rota responsável por salvar uma nova postagem no DB
    router.post('/postagens/nova', admin, (req, res) => {
        var erros = []

        if (req.body.categoria == '0') {
            erros.push({texto: 'Categoria inválida, registre uma Categoria!'})
        }

        if (erros.length > 0) {
            res.render('admin/addPostagem', {erros: erros})
        } else {
            // Cria o objeto de Postagem
            const novaPostagem = {
                titulo:    req.body.titulo,
                slug:      req.body.slug,
                descricao: req.body.descricao,
                conteudo:  req.body.conteudo,
                categoria: req.body.categoria,
                descricao: req.body.descricao
            }

            // Insere o novo Objeto no DB
            new Postagem(novaPostagem).save()
            .then(() => {
                req.flash('success_msg', 'Postagem criada com Sucesso!')
                res.redirect('/admin/postagens')
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro durante o salvamento da Postagem!')
                res.redirect('/admin/postagens')
            })
        }
    })

    // Rota responsável por chamar a página de edição de Postagem
    router.get('/postagens/edit/:id', admin, (req, res) => {
        // Procura o registro pelo id
        Postagem.findOne({_id: req.params.id}).lean()
        .then((postagem) => {
            console.log('Postagem encontrada no DB!')
             // Busca as categorias
            Categoria.find().lean()
            .then((categorias) => {
                res.render('admin/editPostagem', {
                    postagem: postagem,
                    categorias: categorias
                })
            }).catch((err) => {
                console.log('Erro ao carregar o formulário!', err)
                // Exibe o erro
                req.flash('error_msg', 'Erro ao carregar o formulário!')
                res.redirect('/admin/postagens')
            })
        }).catch((err) => {
            console.log('Erro ao buscar Postagem', err)
            req.flash('error_msg', 'Esta Postagem não existe!')
            res.redirect('/admin/postagens')
        })
    })

    // Rota responsável por salvar no DB os dados editados da postagem
    router.post('/postagens/edit', admin, (req, res) => {
        Postagem.findOne({_id: req.body.id})
        .then((postagem) => {
            // Atualiza os dados
            postagem.titulo    = req.body.titulo
            postagem.slug      = req.body.slug
            postagem.descricao = req.body.descricao
            postagem.conteudo  = req.body.conteudo
            postagem.categoria = req.body.categoria
            // Salva os dados atualizados
            postagem.save()
            .then(() => {
                req.flash('success_msg', 'Postagem editada com Sucesso!')
                res.redirect('/admin/postagens')
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao salvar a edição da Postagem!')
                res.redirect('/admin/postagens')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao editar a Postagem')
            res.redirect('/admin/postagens')
        })
    })

    // Rota responsavel por deletar uma Postagem
    router.post('/postagens/deletePostagem', (req, res) => {
        Postagem.deleteOne({_id: req.body.id})
        .then(() => {
            req.flash('success_msg', 'Postagem excluida com sucesso!')
            res.redirect('/admin/postagens')
        }).catch((err) => {
            console.log('Erro ao excluir Postagem!', err)
            req.flash('error_msg', 'Erro ao excluir Postagem!')
            res.redirect('/admin/postagens')
        })
    })

    // Rota responsável por abir a página de Usuários Cadastrados
    router.get('/usuarios', (req, res) => {
        Usuario.find().sort({admin: 'DESC'}).lean()
        .then((usuarios) => {
            res.render('admin/usuarios', {usuarios: usuarios})
        }).catch((err) => {

        })
    })
    
    router.post('/usuarios/deleteUsuario', (req, res) => {
        Usuario.deleteOne({_id: req.body.id})
        .then(() => {
            req.flash('success_msg', 'Usuário excluido com sucesso!')
            res.redirect('/admin/usuarios')
        }).catch((err) => {
            console.log('Erro ao excluir Usuário!', err)
            req.flash('error_msg', 'Erro ao excluir Usuário!')
            res.redirect('/admin/usuarios')
        })
    })


module.exports = router