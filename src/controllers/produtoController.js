// Importa o módulo de conexão com o banco de dados
const db = require("../database/db");

module.exports = {
    // Função para obter todos os produtos
    async getAll(req, res) {
        try {
            const result = await db.query("SELECT * FROM produtos");
            res.status(200).json(result.rows);
        } catch (error) {
            console.error("Erro ao buscar produtos:", error.message);
            res.status(500).json({ message: "Erro ao buscar produtos" });
        }
    },

    // Função para criar um novo produtos
    async create(req, res) {
        const { nome, valor, created_by } = req.body;
        if (!nome || !valor) {
            return res.status(400).json({ message: "Dados incompletos" });
        }
        try {
            const productCheck = await db.query("SELECT * FROM produtos WHERE nome = $1", [nome]);
            if (productCheck.rows.length > 0) {
                return res.status(400).json({ message: "Produto já existe" });
            }
            // nome do produto, valor do produto e criador por qual empresa
            const result = await db.query(
                "INSERT INTO produtos (nome, valor, created_by) VALUES ($1, $2, $3) RETURNING *",
                [nome, valor, created_by]
            );
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error("Erro ao criar produto:", error.message);
            res.status(500).json({ message: "Erro ao criar produto" });
        }
    },

    // Função para atualizar um produto existente
    async update(req, res) {
        const { id } = req.params;
        const { nome, valor } = req.body;
        if (!id || !nome || !valor) {
            return res.status(400).json({ message: "Dados incompletos" });
        }
        try {
            const productCheck = await db.query("SELECT * FROM produtos WHERE id = $1", [id]);
            if (productCheck.rows.length === 0) {
                return res.status(404).json({ message: "Produto não encontrado" });
            }
            const result = await db.query(
                "UPDATE produtos SET nome = $1, valor = $2 WHERE id = $3 RETURNING *",
                [nome, valor, id]
            );
            res.status(200).json(result.rows[0]);
        } catch (error) {
            console.error("Erro ao atualizar produto:", error.message);
            res.status(500).json({ message: "Erro ao atualizar produto" });
        }
    },

    // Função para excluir um produto
    async delete(req, res) {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "ID não fornecido" });
        }
        try {
            const productCheck = await db.query("SELECT * FROM produtos WHERE id = $1", [id]);
            if (productCheck.rows.length === 0) {
                return res.status(404).json({ message: "Produto não encontrado" });
            }
            await db.query("DELETE FROM produtos WHERE id = $1", [id]);
            res.status(204).send();
        } catch (error) {
            console.error("Erro ao excluir produto:", error.message);
            res.status(500).json({ message: "Erro ao excluir produto" });
        }
    }
};
