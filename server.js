const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "sistema_login",
    waitForConnections: true,
    connectionLimit: 10,
    charset: "utf8mb4"
});

const sessoes = new Map();

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
});

app.post("/login", async (req, res) => {
    const { login, senha } = req.body;

    if (!login || !senha) {
        return res.status(400).json({ success: false, message: "Informe usuário e senha!" });
    }

    try {
        const [rows] = await pool.execute(
            "SELECT id, nome, email, senha, tipo_usuario FROM usuarios WHERE email = ? OR nome = ?",
            [login, login]
        );

        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: "Credenciais inválidas!" });
        }

        const usuario = rows[0];
        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return res.status(401).json({ success: false, message: "Credenciais inválidas!" });
        }

        const token = crypto.randomBytes(32).toString("hex");

        sessoes.set(token, {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            tipo: usuario.tipo_usuario
        });

        return res.json({
            success: true,
            message: "Login realizado com sucesso!",
            token,
            user: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo_usuario: usuario.tipo_usuario
            }
        });
    } catch (err) {
        console.error("Erro no login:", err);
        return res.status(500).json({ success: false, message: "Erro interno do servidor!" });
    }
});

app.post("/cadastro", async (req, res) => {
    const { nome, email, senha, tipo_usuario } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ success: false, message: "Preencha todos os campos!" });
    }

    const nomeLimpo = String(nome).trim();
    const emailLimpo = String(email).trim().toLowerCase();

    if (nomeLimpo.split(/\s+/).filter(Boolean).length < 2) {
        return res.status(400).json({ success: false, message: "Informe seu nome completo!" });
    }

    if (!/^\S+@\S+$/.test(emailLimpo)) {
        return res.status(400).json({ success: false, message: "E-mail inválido!" });
    }

    if (String(senha).length < 6) {
        return res.status(400).json({ success: false, message: "A senha deve ter pelo menos 6 caracteres!" });
    }

    const tiposValidos = ["aluno", "professor", "admin"];
    const tipo = tiposValidos.includes(tipo_usuario) ? tipo_usuario : "aluno";

    try {
        const [existe] = await pool.execute(
            "SELECT id FROM usuarios WHERE email = ?",
            [emailLimpo]
        );

        if (existe.length > 0) {
            return res.status(409).json({ success: false, message: "Este e-mail já está cadastrado!" });
        }

        const senhaHash = await bcrypt.hash(String(senha), 10);

        const [resultado] = await pool.execute(
            "INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES (?, ?, ?, ?)",
            [nomeLimpo, emailLimpo, senhaHash, tipo]
        );

        const token = crypto.randomBytes(32).toString("hex");

        sessoes.set(token, {
            id: resultado.insertId,
            nome: nomeLimpo,
            email: emailLimpo,
            tipo
        });

        return res.status(201).json({
            success: true,
            message: "Cadastro realizado com sucesso!",
            token,
            user: {
                id: resultado.insertId,
                nome: nomeLimpo,
                email: emailLimpo,
                tipo_usuario: tipo
            }
        });
    } catch (err) {
        console.error("Erro no cadastro:", err);
        return res.status(500).json({ success: false, message: "Erro interno do servidor!" });
    }
});

app.get("/sessao", (req, res) => {
    const token = (req.headers.authorization || "").replace("Bearer ", "");

    if (!token || !sessoes.has(token)) {
        return res.status(401).json({ success: false });
    }

    return res.json({ success: true, user: sessoes.get(token) });
});

app.post("/logout", (req, res) => {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    sessoes.delete(token);
    return res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});