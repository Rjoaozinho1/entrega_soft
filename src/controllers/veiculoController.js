// Importa o módulo de conexão com o banco de dados
const db = require("../database/db");

module.exports = {
    // Função para obter todos os veículos
    async getAll(req, res) {
        try {
            const result = await db.query("SELECT * FROM veiculos");
            res.status(200).json(result.rows);
        } catch (error) {
            console.error("Erro ao buscar veículos:", error.message);
            res.status(500).json({ message: "Erro ao buscar veículos" });
        }
    },

    // Função para criar um novo veículo
    async create(req, res) {
        const { tipo, peso, placa } = req.body;
        if (!tipo || !peso || !placa) {
            return res.status(400).json({ message: "Dados incompletos" });
        }
        try {
            const vehicleCheck = await db.query("SELECT * FROM veiculos WHERE placa = $1", [placa]);
            if (vehicleCheck.rows.length > 0) {
                return res.status(400).json({ message: "Veículo já existe" });
            }
            const result = await db.query(
                "INSERT INTO veiculos (tipo, peso, placa) VALUES ($1, $2, $3) RETURNING *",
                [tipo, peso, placa]
            );
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error("Erro ao criar veículo:", error.message);
            res.status(500).json({ message: "Erro ao criar veículo" });
        }
    },

    // Função para atualizar um veículo existente
    async update(req, res) {
        const { id } = req.params;
        const { tipo, peso, placa } = req.body;
        if (!id || !tipo || !peso || !placa) {
            return res.status(400).json({ message: "Dados incompletos" });
        }
        try {
            const vehicleCheck = await db.query(
                "SELECT * FROM veiculos WHERE placa = $1",
                [placa]
            );
            if (vehicleCheck.rows.length > 0) {
                return res.status(400).json({ message: "Veículo com a mesma placa já existe" });
            }
            const result = await db.query(
                "UPDATE veiculos SET tipo = $1, peso = $2, placa = $3 WHERE id = $4 RETURNING *",
                [tipo, peso, placa, id]
            );
            res.status(200).json(result.rows[0]);
        } catch (error) {
            console.error("Erro ao atualizar veículo:", error.message);
            res.status(500).json({ message: "Erro ao atualizar veículo" });
        }
    },

    // Função para excluir um veículo
    async delete(req, res) {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "ID não fornecido" });
        }
        try {
            const vehicleCheck = await db.query("SELECT * FROM veiculos WHERE id = $1", [id]);
            if (vehicleCheck.rows.length === 0) {
                return res.status(404).json({ message: "Veículo não encontrado" })
            }
            await db.query("DELETE FROM veiculos WHERE id = $1", [id]);
            res.status(204).send();
        } catch (error) {
            console.error("Erro ao excluir usuário:", error.message);
            res.status(500).json({ message: "Erro ao excluir veículo" });
        }
    }
};
