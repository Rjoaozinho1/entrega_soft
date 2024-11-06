// Importa o módulo de conexão com o banco de dados
const db = require("../database/db");

module.exports = {
    // Função para obter todos os fretes
    async getAll(req, res) {
        try {
            const result = await db.query("SELECT * FROM fretes");
            res.status(200).json(result.rows);
        } catch (error) {
            console.error("Erro ao buscar fretes:", error.message);
            res.status(500).json({ message: "Erro ao buscar fretes" });
        }
    },

    async getSingleFrete(req, res) {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ message: "ID não fornecido" });
        }
        try {
            const result = await db.query("SELECT * FROM fretes WHERE id=$1", [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ message: "Frete não encontrado" });
            }
            res.status(200).json(result.rows[0]);
        } catch (error) {
            console.error("Erro ao buscar frete específico:", error.message);
            res.status(500).json({ message: "Erro ao buscar frete específico" });
        }
    },

    // Função para criar um novo frete
    async create(req, res) {
        const { distance, price, status, vehicle_id, entregador_id, product_id } = req.body;
        if (!distance || !price || !status) {
            return res.status(400).json({ message: "Dados incompletos" });
        }
        try {
            const duplicateCheck = await db.query(
                "SELECT * FROM fretes WHERE distance = $1 AND price = $2",
                [distance, price]
            );
            if (duplicateCheck.rows.length > 0) {
                return res.status(409).json({ message: "Frete duplicado" });
            }
            const result = await db.query(
                "INSERT INTO fretes (distance, price, status, product_id, entregador_id, vehicle_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
                [distance, price, status, product_id, entregador_id, vehicle_id]
            );
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error("Erro ao criar frete:", error.message);
            res.status(500).json({ message: "Erro ao criar frete" });
        }
    },

    // Função para excluir um frete
    async delete(req, res) {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ message: "ID não fornecido" });
        }
        try {
            const frete = await db.query("SELECT * FROM fretes WHERE id = $1", [id]);
            if (frete.rows.length === 0) {
                return res.status(404).json({ message: "Frete não encontrado" });
            }
            await db.query("DELETE FROM fretes WHERE id = $1", [id]);
            res.status(204).send();
        } catch (error) {
            console.error("Erro ao excluir frete:", error.message);
            res.status(500).json({ message: "Erro ao excluir frete" });
        }
    },

    async update(req, res) {
        const { id } = req.query;
        const { status } = req.body;
        if (!id || !status) {
            return res.status(400).json({ message: "Dados incompletos" });
        }
        try {
            const frete = await db.query("SELECT * FROM fretes WHERE id = $1", [id]);
            if (frete.rows.length === 0) {
                return res.status(404).json({ message: "Frete não encontrado" });
            }
            const result = await db.query(
                "UPDATE fretes SET status = $1 WHERE id = $2 RETURNING *",
                [status, id]
            );
            res.status(200).json(result.rows[0]);
        } catch (error) {
            console.error("Erro ao atualizar frete:", error.message);
            res.status(500).json({ message: "Erro ao atualizar frete" });
        }
    }
};

// Função para calcular o custo do frete
function calculateFreteCost(distance, vehicleWeight) {
    const baseValue = distance * vehicleWeight;
    let taxRate = 0;

    if (distance <= 100) {
        taxRate = 0.20;
    } else if (distance <= 200) {
        taxRate = 0.15;
    } else if (distance <= 500) {
        taxRate = 0.10;
    } else {
        taxRate = 0.075;
    }

    const taxAmount = baseValue * taxRate;
    const driverEarnings = baseValue - taxAmount;

    return { baseValue, taxAmount, driverEarnings };
}