import { Router } from "express";
import cartModel from "../models/cart.model.js";

const router = Router();

// 1. Crear carrito (POST /api/carts)
router.post("/", async (req, res) => {
    try {
        const newCart = await cartModel.create({ products: [] });
        res.status(201).json({ status: "success", payload: newCart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. AGREGAR PRODUCTO AL CARRITO (POST /api/carts/:cid/product/:pid)
// ESTA ES LA QUE TE FALTABA
router.post("/:cid/product/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cart = await cartModel.findById(cid);
        
        if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

        // Buscamos si el producto ya existe en el carrito
        const existingProduct = cart.products.find(p => p.product.toString() === pid);

        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.products.push({ product: pid, quantity: 1 });
        }

        await cart.save();
        res.json({ status: "success", payload: cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Ver carrito con Populate (GET /api/carts/:cid)
router.get("/:cid", async (req, res) => {
    try {
        const cart = await cartModel.findById(req.params.cid).populate("products.product");
        res.json({ status: "success", payload: cart });
    } catch (error) {
        res.status(500).json({ error: "ID no válido" });
    }
});

export default router;