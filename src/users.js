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
        type: Number,
    },
    photo: {
        type: String,
    }
});

const UserModel = mongoose.model(userCollection, userSchema);

export default UserModel