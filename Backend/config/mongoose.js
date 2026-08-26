import mongoose from 'mongoose';
import logger from './logger.js';

const connectMongo = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in the environment variables.');
    }
    
    mongoose.connection.on('connected', () => {
      logger.info('[Mongoose] MongoDB successfully connected.');
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`[Mongoose] Connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('[Mongoose] Disconnected.');
    });

    // Determine debug mode
    if (process.env.NODE_ENV === 'development') {
      mongoose.set('debug', (collectionName, method, query, doc) => {
        logger.debug(`[Mongoose] ${collectionName}.${method}`, JSON.stringify(query));
      });
    }

    await mongoose.connect(mongoUri, {
      maxPoolSize: 50,
      wtimeoutMS: 2500,
      connectTimeoutMS: 10000,
    });

  } catch (error) {
    logger.error(`[Mongoose] Error initializing MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectMongo;
