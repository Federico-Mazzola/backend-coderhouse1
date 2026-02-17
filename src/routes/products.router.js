import { Router } from "express";
import productModel from "../models/product.model.js";

const router = Router();

// 1. GET /api/products (Con Paginación, Filtros y Ordenamiento)
router.get("/", async (req, res) => {
    try {
        let { limit = 10, page = 1, sort, query } = req.query;

        // Filtro por categoría o por disponibilidad
        const filter = query ? { 
            $or: [
                { category: query },
                { status: query === "true" }
            ] 
        } : {};

        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            lean: true
        };

        if (sort) {
            options.sort = { price: sort === "asc" ? 1 : -1 };
        }

        const result = await productModel.paginate(filter, options);

        res.json({
            status: "success",
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? `/api/products?page=${result.prevPage}` : null,
            nextLink: result.hasNextPage ? `/api/products?page=${result.nextPage}` : null
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

// 2. GET /api/products/:pid (Buscar por ID en Mongo)
router.get("/:pid", async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await productModel.findById(pid);
        if (!product) return res.status(404).json({ status: "error", message: "Producto no encontrado" });
        res.json({ status: "success", payload: product });
    } catch (error) {
        res.status(500).json({ status: "error", message: "ID no válido" });
    }
});

// 3. POST /api/products (Crear producto en Mongo)
router.post("/", async (req, res) => {
    try {
        const newProduct = req.body;
        const result = await productModel.create(newProduct);
        res.status(201).json({ status: "success", payload: result });
    } catch (error) {
        res.status(400).json({ status: "error", message: "Error al crear producto (revisa que el 'code' no esté repetido)" });
    }
});

// 4. PUT /api/products/:pid (Actualizar en Mongo)
router.put("/:pid", async (req, res) => {
    try {
        const { pid } = req.params;
        const updatedFields = req.body;
        const result = await productModel.findByIdAndUpdate(pid, updatedFields, { new: true });
        res.json({ status: "success", payload: result });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al actualizar" });
    }
});

// 5. DELETE /api/products/:pid (Eliminar en Mongo)
router.delete("/:pid", async (req, res) => {
    try {
        const { pid } = req.params;
        await productModel.findByIdAndDelete(pid);
        res.json({ status: "success", message: "Producto eliminado" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al eliminar" });
    }
});

export default router;