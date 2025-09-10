import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { seedPlaces } from './app/seeders/places.seed.js';

// Seeder map
const seeders = {
  places: seedPlaces
};

// Clear all collections
const clearDatabase = async () => {
  const collections = Object.keys(mongoose.connection.collections);
  for (const name of collections) {
    try {
      await mongoose.connection.collections[name].deleteMany({});
      console.log(`🗑️ Cleared ${name} collection`);
    } catch (err) {
      console.error(`❌ Failed to clear ${name}:`, err.message);
    }
  }
};

// Clear specific collection
const clearOneCollection = async (name) => {
  try {
    const collection = mongoose.connection.collections[name];
    if (!collection) {
      console.error(`❌ Collection "${name}" does not exist.`);
      return;
    }
    await collection.deleteMany({});
    console.log(`🧹 Cleared collection: ${name}`);
  } catch (err) {
    console.error(`❌ Failed to clear ${name}:`, err.message);
  }
};

const runSeeders = async () => {
  const args = process.argv;

  const shouldClearAll = args.includes('--clear');
  const clearOnly = args.includes('--clear-only') ? args[args.indexOf('--clear-only') + 1] : null;
  const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;

  await connectDB();

  if (shouldClearAll) {
    console.log('\n⚠️ Clearing ALL collections...');
    await clearDatabase();
  }

  if (clearOnly) {
    console.log(`\n⚠️ Clearing ONLY collection: ${clearOnly}`);
    await clearOneCollection(clearOnly);
  }

  if (only) {
    const seeder = seeders[only];
    if (!seeder) {
      console.error(`❌ Seeder "${only}" not found.`);
    } else {
      console.log(`\n🌱 Seeding only: ${only}`);
      await seeder();
    }
  } else if (!only && !clearOnly) {
    for (const [name, seeder] of Object.entries(seeders)) {
      console.log(`\n🌱 Seeding: ${name}`);
      await seeder();
    }
  }

  console.log('\n✅ Seeder script completed.');
  process.exit(0);
};

runSeeders();