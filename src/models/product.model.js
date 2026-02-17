import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productCollection = "products";

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    thumbnail: { type: String },
    code: { type: String, unique: true, required: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true },
    status: { type: Boolean, default: true }
});

// Esto activa la paginación automática para este modelo
productSchema.plugin(mongoosePaginate);

const productModel = mongoose.model(productCollection, productSchema);

export default productModel;