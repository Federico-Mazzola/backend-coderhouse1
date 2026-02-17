import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";

// Routers
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js"; 

dotenv.config();

const app = express();
const PORT = 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Conexión a MongoDB (Mejorada) ---
const connectionString = process.env.MONGO_URL;

mongoose.connect(connectionString)
    .then(() => console.log("✅ Conectado con éxito a MongoDB Atlas"))
    .catch(error => {
        console.error("❌ Error de conexión:", error);
        process.exit(); // Detiene el servidor si no hay base de datos
    });

// --- Configuración de Handlebars ---
app.engine("handlebars", engine({
    helpers: {
        multiply: (num1, num2) => num1 * num2
    },
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }
}));
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// --- Middlewares ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

// --- Rutas ---
app.use("/", viewsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

app.listen(PORT, () => {
    console.log(`🚀 Servidor listo en http://localhost:${PORT}`);
});