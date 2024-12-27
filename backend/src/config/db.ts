import mongoose from 'mongoose';

class Database {
    private static instance: Database;
    private connection!: mongoose.Connection;

    //No direct initiation
    private constructor() {}

    //Getting single instance
    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    // Connect to the database
    public async connect(): Promise<void> {
        const dbUri: string = process.env.MONGO_URI || 'mongodb://mongodb:27017/scisubmit';
        try {
            const connection = await mongoose.connect(dbUri);
            this.connection = connection.connection;
            console.log('Database connected successfully');
        } catch (err) {
            console.error('Database connection error:', err);
            throw new Error('Failed to connect to the database');
        }
    }

    // Get the connection object
    public getConnection(): mongoose.Connection {
        if (!this.connection) {
            throw new Error('Database connection has not been established.');
        }
        return this.connection;
    }
}

export default Database;