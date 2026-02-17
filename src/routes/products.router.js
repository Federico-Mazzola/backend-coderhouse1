import { Router } from "express";
import productModel from "../models/product.model.js";

const router = Router();

// 1. GET /api/products (Con Paginación, Filtros y Ordenamiento)
router.get("/", async (req, res) => {
    try {
        let { limit = 10, page = 1, sort, query } = req.query;

        // --- Lógica de Filtro (Consigna: categoría o disponibilidad) ---
        let filter = {};
        if (query) {
            // Si el query es "true" o "false", filtramos por el campo 'status'
            if (query === "true" || query === "false") {
                filter = { status: query === "true" };
            } else {
                // Si no, filtramos por la categoría
                filter = { category: query };
            }
        }

        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            lean: true, // Importante para Handlebars
            sort: sort ? { price: sort === "asc" ? 1 : -1 } : {}
        };

        const result = await productModel.paginate(filter, options);

        // --- Construcción de Links (Manteniendo filtros y orden) ---
        // Esto asegura que al tocar "Siguiente" se mantengan el limit, el query y el sort
        const baseUrl = "/api/products";
        const extraParams = `&limit=${limit}${sort ? `&sort=${sort}` : ""}${query ? `&query=${query}` : ""}`;

        res.json({
            status: "success",
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? `${baseUrl}?page=${result.prevPage}${extraParams}` : null,
            nextLink: result.hasNextPage ? `${baseUrl}?page=${result.nextPage}${extraParams}` : null
        });

    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

// 2. GET /api/products/:pid (Buscar por ID)
router.get("/:pid", async (req, res) => {
    try {
        const product = await productModel.findById(req.params.pid);
        if (!product) return res.status(404).json({ status: "error", message: "Producto no encontrado" });
        res.json({ status: "success", payload: product });
    } catch (error) {
        res.status(500).json({ status: "error", message: "ID no válido" });
    }
});

// 3. POST /api/products (Crear)
router.post("/", async (req, res) => {
    try {
        const result = await productModel.create(req.body);
        res.status(201).json({ status: "success", payload: result });
    } catch (error) {
        res.status(400).json({ status: "error", message: "Error al crear producto (revisa el campo 'code')" });
    }
});

// 4. PUT /api/products/:pid (Actualizar)
router.put("/:pid", async (req, res) => {
    try {
        const result = await productModel.findByIdAndUpdate(req.params.pid, req.body, { new: true });
        if (!result) return res.status(404).json({ status: "error", message: "Producto no encontrado" });
        res.json({ status: "success", payload: result });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al actualizar" });
    }
});

// 5. DELETE /api/products/:pid (Eliminar)
router.delete("/:pid", async (req, res) => {
    try {
        const result = await productModel.findByIdAndDelete(req.params.pid);
        if (!result) return res.status(404).json({ status: "error", message: "Producto no encontrado" });
        res.json({ status: "success", message: "Producto eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al eliminar" });
    }
});

export default router;