import { Router } from "express";
import cartModel from "../models/cart.model.js";

const router = Router();

// 1. CREAR CARRITO (POST /api/carts)
router.post("/", async (req, res) => {
    try {
        const newCart = await cartModel.create({ products: [] });
        res.status(201).json({ status: "success", payload: newCart });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

// 2. VER CARRITO ESPECÍFICO CON POPULATE (GET /api/carts/:cid)
router.get("/:cid", async (req, res) => {
    try {
        const { cid } = req.params;
        // La consigna pide desglosar los productos asociados mediante populate
        const cart = await cartModel.findById(cid).populate("products.product");

        if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

        res.json({ status: "success", payload: cart });
    } catch (error) {
        res.status(500).json({ status: "error", message: "ID de carrito no válido" });
    }
});

// 3. AGREGAR UN PRODUCTO AL CARRITO (POST /api/carts/:cid/product/:pid)
router.post("/:cid/product/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cart = await cartModel.findById(cid);

        if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

        const existingProduct = cart.products.find(p => p.product.toString() === pid);

        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.products.push({ product: pid, quantity: 1 });
        }

        await cart.save();
        res.json({ status: "success", payload: cart });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

// 4. ELIMINAR UN PRODUCTO ESPECÍFICO DEL CARRITO (DELETE /api/carts/:cid/products/:pid)
router.delete("/:cid/products/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cart = await cartModel.findById(cid);

        if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

        const initialLength = cart.products.length;
        // Filtramos para mantener solo los productos que NO sean el seleccionado
        cart.products = cart.products.filter(p => p.product.toString() !== pid);

        if (cart.products.length === initialLength) {
            return res.status(404).json({ status: "error", message: "El producto no existe en este carrito" });
        }

        await cart.save();
        res.json({ status: "success", message: "Producto eliminado del carrito satisfactoriamente" });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

// 5. ACTUALIZAR CARRITO CON UN ARREGLO DE PRODUCTOS (PUT /api/carts/:cid)
router.put("/:cid", async (req, res) => {
    try {
        const { cid } = req.params;
        const { products } = req.body; // Se espera recibir un array: [{product: "id", quantity: 2}, ...]

        if (!Array.isArray(products)) {
            return res.status(400).json({ status: "error", message: "Se esperaba un arreglo de productos" });
        }

        const cart = await cartModel.findByIdAndUpdate(cid, { products }, { new: true });
        res.json({ status: "success", message: "Carrito actualizado", payload: cart });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

// 6. ACTUALIZAR SOLO LA CANTIDAD DE UN PRODUCTO (PUT /api/carts/:cid/products/:pid)
router.put("/:cid/products/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        if (!quantity || isNaN(quantity)) {
            return res.status(400).json({ status: "error", message: "Se requiere una cantidad numérica válida" });
        }

        const cart = await cartModel.findById(cid);
        if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

        const productIndex = cart.products.findIndex(p => p.product.toString() === pid);

        if (productIndex !== -1) {
            cart.products[productIndex].quantity = quantity;
            await cart.save();
            res.json({ status: "success", message: "Cantidad actualizada correctamente" });
        } else {
            res.status(404).json({ status: "error", message: "Producto no encontrado dentro del carrito" });
        }
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

// 7. VACIAR EL CARRITO COMPLETO (DELETE /api/carts/:cid)
router.delete("/:cid", async (req, res) => {
    try {
        const { cid } = req.params;
        // Actualizamos el arreglo de productos a uno vacío
        const cart = await cartModel.findByIdAndUpdate(cid, { products: [] }, { new: true });

        if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

        res.json({ status: "success", message: "Todos los productos han sido eliminados del carrito", payload: cart });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

export default router;