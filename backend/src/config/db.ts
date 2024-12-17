import mongoose from 'mongoose';

class Database {
    private static instance: Database;
    private connection!: mongoose.Connection;

    //No direct initiation
    private constructor() {
        this.connect();
    }

    //Getting single instance
    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    //Connection to database
    private connect(): void {
        const dbUri: string = process.env.DB_URI || 'mongodb://localhost:27017/scisubmit';
        mongoose
            .connect(dbUri)
            .then(() => {
                console.log('Database connected successfully');
                this.connection = mongoose.connection;
            })
            .catch(err => {
                console.error('Database connection error:', err);
            });
    }

    //Get object from connection
    public getConnection(): mongoose.Connection {
        return this.connection;
    }
}

export default Database;