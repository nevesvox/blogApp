const express  = require('express')
const router   = express.Router()
const mongoose = require('mongoose')
const bcryptjs = require('bcryptjs')
const passport = require('passport')

// Models
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')

// Rotas
    // Rota responsavel por chamar a página de Cadastro de Usuários
    router.get('/registro', (req, res) => {
        res.render('usuarios/registro')
    })

    // Rota responsável por criar o registro do Usuário dentro do DB
    router.post('/registro', (req, res) => {
        // Inicializa o array de erros
        var erros = []
        // Verifica os dados / Valida
        if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
            erros.push({texto: 'Nome inválido!'})
        }
        if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
            erros.push({texto: 'Email inválido!'})
        }
        if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
            erros.push({texto: 'Senha inválida!'})
        }
        if (req.body.senha.length < 6) {
            erros.push({texto: 'A senha deve possuir mais que 6 digitos!'})
        }
        if (req.body.senha != req.body.senha2) {
            erros.push({texto: 'As senhas devem ser iguais. Por favor, verifique!'})
        }
        // Verifica se possui erros
        if (erros.length > 0) {
            res.render('usuarios/registro', {erros: erros})
        } else {
            // Verifica se já possui algum cadastro com o email inserido
            Usuario.findOne({email: req.body.email}).lean()
            .then((usuario) => {
                if (usuario) {
                    req.flash('error_msg', 'Este e-mail já está vinculado com uma conta!')
                    res.redirect('/usuarios/registro')
                } else {
                    // Cria um objeto de Usuário
                    const novoUsuario = new Usuario({
                        nome: req.body.nome,
                        email: req.body.email,
                        senha: req.body.senha,
                        // admin: 1
                    })
                    // Cria um Hash da senha
                    bcryptjs.genSalt(10, (erro, salt) => {
                        bcryptjs.hash(novoUsuario.senha, salt,
                            (erro, hash) => {
                                // Verifica se ocorreu erro
                                if (erro) {
                                    req.flash('error_msg', 'Houve um erro durante o Cadastro!')
                                    res.redirect('/')
                                } else {
                                    // Atualiza a senha do usuário com o hash se tudo estiver correto
                                    novoUsuario.senha = hash
                                    // Salva o novo usuário no DB
                                    novoUsuario.save()
                                    .then(() => {
                                        req.flash('success_msg', 'Cadastro realizado com sucesso!')
                                        res.redirect('/')
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Erro ao Cadastrar, tente novamente!')
                                        res.redirect('/usuarios/registro')
                                    })
                                }
                            }
                        )
                    })
                }
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro interno!')
                res.redirect('/')
            })
        }
    })

    // Rota responsável por chamar a página de login
    router.get('/login', (req, res) => {
        res.render('usuarios/login')
    })

    // Rota responsável pelo login do Usuário
    router.post('/login', (req, res, next) => {
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/usuarios/login',
            failureFlash: true
        })(req, res, next)
    })




module.exports = router