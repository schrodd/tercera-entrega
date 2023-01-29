import mongoose from "mongoose";

const userCollection = "users";
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        isRequired: true,
    },
    password: {
        type: String,
        isRequired: true,
    },
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    address: {
        type: String,
    },
    age: {
        type: Number,
    },
    phone: {
        type: String,
    },
    photo: {
        type: String,
    },
    cart: [{ type: Object }]
});

const UserModel = mongoose.model(userCollection, userSchema);

export default UserModel