const request = require('supertest');
const app = require('../src/server');
const { verifyToken, checkRole } = require('../src/utils/auth');

// mock de autenticação para simular um usuário autenticado
jest.mock("../src/utils/auth", () => ({
    verifyToken: (req, res, next) => next(),
    checkRole: (role) => (req, res, next) => next(),
}));
// Mock do controller para simular a resposta
jest.mock("../src/controllers/userController", () => ({
    getAll: (req, res) => res.status(200).json([{ email: "user@teste.com", password: "123", role: "admin" }]),
}));

describe('Testando rotas de usuários', () => {
    test('GET /usuarios - deve retornar uma lista de usuários', async () => {
        const response = await request(app).get("/usuarios");
        expect(response.status).toBe(200);
        expect(response.body).toEqual([{ email: "user@teste.com", password: "123", role: "admin" }]);
    });
});
