CREATE DATABASE IF NOT EXISTS sistema_login 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE sistema_login;


SET FOREIGN_KEY_CHECKS = 0;


DROP TABLE IF EXISTS contas_sociais, recuperacao_senha, tokens_sessao, clientes, usuarios;


CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('aluno', 'professor', 'admin') NOT NULL DEFAULT 'aluno',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    senha_hash VARCHAR(200) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);



CREATE TABLE contas_sociais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    provedor ENUM('google', 'github') NOT NULL,
    provedor_id VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY uk_provedor_usuario (provedor, provedor_id)
);

CREATE TABLE recuperacao_senha (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expira_em DATETIME NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE tokens_sessao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    selector VARCHAR(255) NOT NULL UNIQUE,
    hashed_token VARCHAR(255) NOT NULL,
    expira_em DATETIME NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);


SET FOREIGN_KEY_CHECKS = 1;


INSERT INTO usuarios (nome, email, senha, tipo_usuario) 
VALUES ('Administrador', 'admin@email.com', '$2b$10$Gd43KpT3TqXfADMkgJzA0eNx4mZndtNiKebKlZ/9kedHbQTBNOM7O', 'admin');


INSERT INTO usuarios (nome, email, senha, tipo_usuario) 
VALUES ('Professor Carlos', 'carlos@escola.com', '$2b$10$tIuGXFrsRqTMuqu7zVri1uvz892EdX3LC3Uu3uukaGL31rRQAYK/u', 'professor');


INSERT INTO usuarios (nome, email, senha, tipo_usuario) 
VALUES ('Aluno João', 'joao@email.com', '$2b$10$tIuGXFrsRqTMuqu7zVri1uvz892EdX3LC3Uu3uukaGL31rRQAYK/u', 'aluno');


SHOW TABLES;
SELECT * FROM usuarios;