import { Router } from "express";
import productModel from "../models/product.model.js";
import cartModel from "../models/cart.model.js";

const router = Router();

// Vista de todos los productos con paginación
router.get("/products", async (req, res) => {
    try {
        const { page = 1, limit = 12, sort } = req.query;
        // Opciones de paginación
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            lean: true // Fundamental para que Handlebars pueda leer los objetos de Mongo
        };

        // Si hay ordenamiento por precio
        if (sort) {
            options.sort = { price: sort === "asc" ? 1 : -1 };
        }

        const result = await productModel.paginate({}, options);

        // Agregamos los links para los botones de la vista
        result.prevLink = result.hasPrevPage ? `/products?page=${result.prevPage}&limit=${limit}${sort ? `&sort=${sort}` : ''}` : null;
        result.nextLink = result.hasNextPage ? `/products?page=${result.nextPage}&limit=${limit}${sort ? `&sort=${sort}` : ''}` : null;

        res.render("products", { products: result });
    } catch (error) {
        res.status(500).render("error", { error: "Error al cargar los productos" });
    }
});

// Vista de un carrito específico
router.get("/carts/:cid", async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartModel.findById(cid).populate("products.product").lean();

        if (!cart) return res.status(404).render("error", { error: "Carrito no encontrado" });

        res.render("cart", { cart });
    } catch (error) {
        res.status(500).render("error", { error: "Error al cargar el carrito" });
    }
});

export default router;