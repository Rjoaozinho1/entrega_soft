const express = require("express");
const userController = require("../controllers/userController");
const veiculoController = require("../controllers/veiculoController");
const freteController = require("../controllers/freteController");
const produtoController = require("../controllers/produtoController");
const { verifyToken, checkRole } = require("../utils/auth");

const router = express.Router();
// Rotas de usuários
router.get("/usuarios", verifyToken, checkRole("admin"), userController.getAll);
router.post("/usuarios", userController.create);
router.post("/usuarios/login", userController.login);
router.put("/usuarios/:id", verifyToken, checkRole("admin"), userController.update);
router.delete("/usuarios/:id", verifyToken, checkRole("admin"), userController.delete);

// Rotas de produtos
router.get("/produtos", verifyToken, checkRole("admin"), produtoController.getAll);
router.post("/produtos", verifyToken, checkRole("admin"), produtoController.create);
router.put("/produtos/:id", verifyToken, checkRole("admin"), produtoController.update);
router.delete("/produtos/:id", verifyToken, checkRole("admin"), produtoController.delete);

// Rotas de veículos
router.get("/veiculos", verifyToken, veiculoController.getAll);
router.post("/veiculos", verifyToken, checkRole("admin"), veiculoController.create);
router.put("/veiculos/:id", verifyToken, checkRole("admin"), veiculoController.update);
router.delete("/veiculos/:id", verifyToken, checkRole("admin"), veiculoController.delete);

// Rotas de fretes
router.get("/fretes", verifyToken, freteController.getAll);
router.get("/fretes/:id", verifyToken, checkRole("admin"), freteController.getSingleFrete);
router.post("/fretes", verifyToken, checkRole("admin"), freteController.create);
router.put("/fretes/:id", verifyToken, freteController.update);
router.delete("/fretes/:id", verifyToken, checkRole("admin"), freteController.delete);

module.exports = router;