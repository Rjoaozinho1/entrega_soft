const express = require("express");
const routes = require("./routes/routes");
const { createTables } = require("./database/db");

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware para parsing de JSON
app.use(express.json());
// Usa as rotas definidas em routes.js
app.use("/", routes);
// Inicia o servidor
app.listen(PORT, () => {
    // Cria as tabelas ao iniciar o servidor
    createTables();
    console.log(`Servidor rodando na porta ${PORT}`);
});
// exporta o server
module.exports = app;