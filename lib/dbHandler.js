import mongoose from 'mongoose';

export default class DbHandler {
    static isConnected = false;

    static async connect() {
        if (this.isConnected && mongoose.connection.readyState === 1) {
            return mongoose.connection;
        }

        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI environment variable is not set');
        }

        try {
            await mongoose.connect(mongoUri, {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });

            this.isConnected = true;
            console.log('MongoDB connected successfully');
            return mongoose.connection;
        } catch (error) {
            throw new Error(`Database connection failed: ${error.message}`);
        }
    }

    static async disconnect() {
        if (this.isConnected) {
            await mongoose.connection.close();
            this.isConnected = false;
        }
    }
}