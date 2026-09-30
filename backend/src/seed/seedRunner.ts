import { runSeed } from './seedData.js';

runSeed()
  .then(() => {
    console.log('Seed runner finished successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seed runner failed:', err);
    process.exit(1);
  });
