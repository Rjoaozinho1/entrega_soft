const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const createTables = async () => {
    const client = await pool.connect();
    try {
        await client.query(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id SERIAL PRIMARY KEY,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'entregador'))
        );

        CREATE TABLE IF NOT EXISTS produtos (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            valor NUMERIC NOT NULL,
            created_by INT REFERENCES usuarios(id) ON DELETE SET NULL
        );
  
  
        CREATE TABLE IF NOT EXISTS veiculos (
            id SERIAL PRIMARY KEY,
            tipo VARCHAR(50) NOT NULL,
            peso NUMERIC NOT NULL,
            placa VARCHAR(10) UNIQUE NOT NULL,
            owner_id INT REFERENCES usuarios(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS fretes (
            id SERIAL PRIMARY KEY,
            distance NUMERIC NOT NULL,
            price NUMERIC NOT NULL,
            status VARCHAR(50) NOT NULL,
            product_id INT REFERENCES produtos(id) ON DELETE SET NULL,
            entregador_id INT REFERENCES usuarios(id) ON DELETE SET NULL,
            vehicle_id INT REFERENCES veiculos(id) ON DELETE SET NULL
        );
      `);
        console.log('Tabelas criadas');
    } catch (err) {
        console.error('Error ao criar tabelas', err);
    } finally {
        client.release();
    }
};

module.exports = {
    query: (text, params) => pool.query(text, params),
    createTables
};