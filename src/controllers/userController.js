// Importa o módulo de conexão com o banco de dados
const db = require("../database/db");
const { generateToken, hashPassword, comparePassword } = require("../utils/auth");

module.exports = {
    // Função para obter todos os usuários
    async getAll(req, res) {
        try {
            const result = await db.query("SELECT * FROM usuarios");
            res.status(200).json(result.rows);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error.message);
            res.status(500).json({ message: "Erro ao buscar usuários" });
        }
    },

    // Função para criar um novo usuário
    async create(req, res) {
        const { email, password, role } = req.body;
        if (!email || !password || !role) {
            return res.status(400).json({ message: "Dados incompletos" });
        }
        console.log(email, password, role)
        try {
            const userCheck = await db.query("SELECT * FROM usuarios WHERE email = $1", [email]);
            if (userCheck.rows.length > 0) {
                return res.status(400).json({ message: "Usuário já existe" });
            }

            const hashedPassword = await hashPassword(password);
            const result = await db.query(
                "INSERT INTO usuarios (email, password, role) VALUES ($1, $2, $3) RETURNING *",
                [email, hashedPassword, role]
            );

            const token = generateToken(result.rows[0]);
            res.status(201).json({ token });
        } catch (error) {
            console.error("Erro ao criar usuário:", error.message);
            res.status(500).json({ message: "Erro ao criar usuário" });
        }
    },

    // Rota de login do usuário
    async login(req, res) {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Dados incompletos" });
        }
        try {
            const result = await db.query("SELECT * FROM usuarios WHERE email = $1", [email]);

            if (result.rows.length == 0) {
                return res.status(404).json({ message: "Usuario Inexistente" });
            }
            const user = result.rows[0];
            if (!user || !(await comparePassword(password, user.password))) {
                return res.status(401).json({ message: "Credenciais inválidas" });
            }
            const token = generateToken(user);
            res.status(200).json({ token, id: user.id, role: user.role });
        } catch (error) {
            console.error("Erro ao realizar login:", error.message);
            res.status(500).json({ message: "Erro ao realizar login" });
        }
    },

    // Função para atualizar um usuário existente
    async update(req, res) {
        const { id } = req.params;
        const { email, password, role } = req.body;

        if (!id || !email || !role) {
            return res.status(400).json({ message: "Dados incompletos" });
        }

        try {
            const userCheck = await db.query("SELECT * FROM usuarios WHERE id = $1", [id]);
            if (userCheck.rows.length === 0) {
                return res.status(404).json({ message: "Usuário não encontrado" });
            }

            const hashedPassword = password ? await hashPassword(password) : userCheck.rows[0].password;
            const result = await db.query(
                "UPDATE usuarios SET email = $1, password = $2, role = $3 WHERE id = $4 RETURNING *",
                [email, hashedPassword, role, id]
            );

            res.status(200).json(result.rows[0]);
        } catch (error) {
            console.error("Erro ao atualizar usuário:", error.message);
            res.status(500).json({ message: "Erro ao atualizar usuário" });
        }
    },

    // Função para excluir um usuário
    async delete(req, res) {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "ID não fornecido" });
        }
        try {
            const userCheck = await db.query("SELECT * FROM usuarios WHERE id = $1", [id]);
            if (userCheck.rows.length === 0) {
                return res.status(404).json({ message: "Usuário não encontrado" });
            }
            await db.query("DELETE FROM usuarios WHERE id = $1", [id]);
            res.status(204).send();
        } catch (error) {
            console.error("Erro ao excluir usuário:", error.message);
            res.status(500).json({ message: "Erro ao excluir usuário" });
        }
    }
};
