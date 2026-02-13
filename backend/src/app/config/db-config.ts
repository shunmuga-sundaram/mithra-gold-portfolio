import { config } from 'dotenv';
import { join } from 'path';
import mongoose from 'mongoose';

// Load environment variables
config({ path: join(__dirname, '../../../.env') });

/**
 * MongoDB Connection Configuration
 *
 * This replaces the TypeORM DataSource with Mongoose connection
 */

// MongoDB connection URL
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mithra_portfolio';

// Connection options
const mongooseOptions = {
    // No need for useNewUrlParser and useUnifiedTopology in Mongoose 6+
    // They're enabled by default
};

/**
 * Connect to MongoDB
 *
 * @returns Promise<typeof mongoose> - Mongoose instance after connection
 */
export async function connectDatabase(): Promise<typeof mongoose> {
    try {
        const connection = await mongoose.connect(MONGODB_URI, mongooseOptions);

        console.log(`✅ MongoDB Connected: ${connection.connection.host}`);
        console.log(`📊 Database Name: ${connection.connection.name}`);

        // Enable query logging in development
        if (process.env.MONGODB_LOG_QUERY === 'true') {
            mongoose.set('debug', true);
            console.log('🔍 MongoDB query logging enabled');
        }

        return connection;
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        throw error;
    }
}

/**
 * Disconnect from MongoDB
 * Useful for graceful shutdown and testing
 */
export async function disconnectDatabase(): Promise<void> {
    try {
        await mongoose.disconnect();
        console.log('🔌 MongoDB Disconnected');
    } catch (error) {
        console.error('❌ MongoDB Disconnect Error:', error);
        throw error;
    }
}

/**
 * Get the Mongoose connection instance
 * Use this to check connection status or access the database
 */
export function getConnection() {
    return mongoose.connection;
}

/**
 * For backward compatibility with TypeORM code
 * This mimics the old getDataSource() function
 */
export default function getDataSource() {
    return {
        initialize: async () => {
            await connectDatabase();
        },
        isInitialized: mongoose.connection.readyState === 1
    };
}
