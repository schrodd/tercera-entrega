import mongoose from "mongoose";

const orderCollection = "orders";
const orderSchema = new mongoose.Schema({
    userid: {
        type: String,
        isRequired: true,
    },
    products: [{ type: Object }]
});

const OrderModel = mongoose.model(orderCollection, orderSchema);

export default OrderModel