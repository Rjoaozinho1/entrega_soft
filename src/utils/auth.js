const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
    throw new Error("SECRET_KEY não está definida no ambiente");
}

// Gera um token JWT para um usuário autenticado
function generateToken(user) {
    return jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: "24h" });
}

// Função para verificar se o token é válido
function verifyToken(req, res, next) {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Token não fornecido" }));
        return;
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            res.writeHead(401, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Token inválido" }));
            return;
        }

        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
}

// Função para criar hash de senha
async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

// Função para verificar a senha
async function comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}

// Função para verificar o papel do usuário
function checkRole(role) {
    return (req, res, next) => {
        if (req.userRole !== role) {
            res.writeHead(403, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Acesso negado" }));
            return;
        }
        next();
    };
}

module.exports = {
    generateToken,
    verifyToken,
    hashPassword,
    comparePassword,
    checkRole
};
