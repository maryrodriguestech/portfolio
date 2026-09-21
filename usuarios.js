/* Simulacao do sistema de login sem servidor.
   Os usuarios ficam salvos no localStorage do navegador.
   As senhas sao armazenadas como hash SHA-256 (demonstracao). */
(function () {
    "use strict";

    var CHAVE_USUARIOS = "portzin_usuarios";
    var CHAVE_TOKEN = "portzin_token";
    var CHAVE_SESSAO = "portzin_usuario";

    /* Usuarios padrao (senhas: admin123, carlos123, joao123) */
    var USUARIOS_PADRAO = [
        { nome: "Administrador", email: "admin@email.com", senha: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9", tipo_usuario: "admin" },
        { nome: "Professor Carlos", email: "carlos@escola.com", senha: "ac9c2c34c9f7ad52528c3422af40a66e2e24aaf2a727831255413c9470158984", tipo_usuario: "professor" },
        { nome: "Aluno Joao", email: "joao@email.com", senha: "8681d505cb1b0344d0c7aa3c0e655c7e3a5add0f0960c1d142070a64cacab031", tipo_usuario: "aluno" }
    ];

    function listarUsuarios() {
        var dados = null;
        try {
            dados = JSON.parse(localStorage.getItem(CHAVE_USUARIOS));
        } catch (e) {
            dados = null;
        }
        if (!Array.isArray(dados)) dados = [];
        return dados;
    }

    function salvarUsuarios(lista) {
        localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(lista));
    }

    function copiarUsuario(u) {
        return { id: u.id, nome: u.nome, email: u.email, tipo_usuario: u.tipo_usuario };
    }

    function inicializar() {
        if (localStorage.getItem(CHAVE_USUARIOS) !== null) return;

        var lista = [];
        USUARIOS_PADRAO.forEach(function (usuario) {
            lista.push({
                id: lista.length + 1,
                nome: usuario.nome,
                email: usuario.email,
                senha: usuario.senha,
                tipo_usuario: usuario.tipo_usuario
            });
        });
        salvarUsuarios(lista);
    }

    function hashSenha(senha) {
        return crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(senha)))
            .then(function (buf) {
                return Array.prototype.map.call(new Uint8Array(buf), function (b) {
                    return ("0" + b.toString(16)).slice(-2);
                }).join("");
            });
    }

    function autenticar(login, senha) {
        var lista = listarUsuarios();
        var alvo = String(login || "").trim().toLowerCase();
        var usuario = null;

        for (var i = 0; i < lista.length; i++) {
            var email = String(lista[i].email || "").toLowerCase();
            var nome = String(lista[i].nome || "").toLowerCase();
            if (email === alvo || nome === alvo) {
                usuario = lista[i];
                break;
            }
        }

        if (!usuario) {
            return Promise.resolve({ success: false, message: "Credenciais invalidas!" });
        }

        return hashSenha(senha).then(function (hash) {
            if (hash !== usuario.senha) {
                return { success: false, message: "Credenciais invalidas!" };
            }
            return { success: true, user: copiarUsuario(usuario) };
        });
    }

    function cadastrar(dados) {
        var nome = String(dados.nome || "").trim();
        var email = String(dados.email || "").trim().toLowerCase();
        var senha = String(dados.senha || "");
        var tipo = dados.tipo_usuario;

        var tiposValidos = ["aluno", "professor", "admin"];
        if (tiposValidos.indexOf(tipo) === -1) tipo = "aluno";

        var lista = listarUsuarios();

        for (var i = 0; i < lista.length; i++) {
            if (String(lista[i].email || "").toLowerCase() === email) {
                return Promise.resolve({ success: false, message: "Este e-mail ja esta cadastrado!" });
            }
        }

        return hashSenha(senha).then(function (hash) {
            var novo = {
                id: lista.reduce(function (max, usuario) { return Math.max(max, usuario.id || 0); }, 0) + 1,
                nome: nome,
                email: email,
                senha: hash,
                tipo_usuario: tipo
            };
            lista.push(novo);
            salvarUsuarios(lista);
            return { success: true, user: copiarUsuario(novo) };
        });
    }

    function criarSessao(usuario) {
        var token = localStorage.getItem(CHAVE_TOKEN) ||
            crypto.getRandomValues(new Uint32Array(4)).join("-") + "-" + Date.now();
        localStorage.setItem(CHAVE_TOKEN, token);
        localStorage.setItem(CHAVE_SESSAO, JSON.stringify(copiarUsuario(usuario)));
        return token;
    }

    function getSessao() {
        if (!localStorage.getItem(CHAVE_TOKEN)) return null;
        try {
            var usuario = JSON.parse(localStorage.getItem(CHAVE_SESSAO));
            return (usuario && usuario.id) ? usuario : null;
        } catch (e) {
            return null;
        }
    }

    function encerrarSessao() {
        localStorage.removeItem(CHAVE_TOKEN);
        localStorage.removeItem(CHAVE_SESSAO);
    }

    inicializar();

    window.Usuarios = {
        autenticar: autenticar,
        cadastrar: cadastrar,
        criarSessao: criarSessao,
        getSessao: getSessao,
        encerrarSessao: encerrarSessao
    };
})();