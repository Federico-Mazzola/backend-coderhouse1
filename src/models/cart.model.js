import mongoose from "mongoose";

const cartCollection = "carts";

const cartSchema = new mongoose.Schema({
    // Definimos que 'products' es un arreglo de objetos
    products: {
        type: [
            {
                // Aquí está la magia: el ID del producto hace referencia a la colección 'products'
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "products" 
                },
                quantity: { type: Number, default: 1 }
            }
        ],
        default: []
    }
});

const cartModel = mongoose.model(cartCollection, cartSchema);

export default cartModel;