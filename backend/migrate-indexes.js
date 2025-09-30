const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const migrateIndexes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('playlists');

    // Get current indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(idx => ({ name: idx.name, key: idx.key })));

    // Drop the problematic old index if it exists
    try {
      await collection.dropIndex({ userId: 1, playlistId: 1 });
      console.log('✅ Dropped old userId_1_playlistId_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  Old index already doesn\'t exist');
      } else {
        console.log('⚠️  Error dropping old index:', error.message);
      }
    }

    // Create the new indexes
    try {
      // Index for YouTube playlists only
      await collection.createIndex(
        { userId: 1, playlistId: 1 }, 
        { 
          unique: true, 
          sparse: true,
          partialFilterExpression: { playlistId: { $exists: true, $ne: null } },
          name: 'youtube_playlists_unique'
        }
      );
      console.log('✅ Created YouTube playlists unique index');

      // Index for manual playlists only
      await collection.createIndex(
        { userId: 1, trackerTitle: 1, sourceType: 1 }, 
        { 
          unique: true,
          partialFilterExpression: { sourceType: 'manual' },
          name: 'manual_playlists_unique'
        }
      );
      console.log('✅ Created manual playlists unique index');

    } catch (error) {
      console.log('⚠️  Error creating new indexes:', error.message);
    }

    // Verify new indexes
    const newIndexes = await collection.indexes();
    console.log('\nNew indexes:', newIndexes.map(idx => ({ 
      name: idx.name, 
      key: idx.key, 
      unique: idx.unique,
      partialFilterExpression: idx.partialFilterExpression 
    })));

    console.log('\n🎉 Index migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
};

// Run the migration
migrateIndexes();