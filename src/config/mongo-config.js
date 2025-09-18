import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

export const connectMongo = async () => {
    try {
        mongoose.connect(MONGO_URI, {})
        console.log('Levanto Mongo')
    } catch (err) {
        console.log('Hubo un error en la conexion de mongo', err);
        process.exit(1);
    }
}