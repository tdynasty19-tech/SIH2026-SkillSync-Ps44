import { migrator, seeder } from '../config/migrator';
import { logger } from '../utils/logger';

const run = async () => {
  const command = process.argv[2] || 'up';

  try {
    switch (command) {
      case 'up': {
        console.log('Executing pending migrations...');
        const executed = await migrator.up();
        console.log(`Successfully executed ${executed.length} migration(s):`);
        executed.forEach((m) => console.log(`  ✓ ${m.name}`));
        break;
      }

      case 'down': {
        console.log('Rolling back last migration...');
        const reverted = await migrator.down();
        console.log(`Successfully rolled back ${reverted.length} migration(s):`);
        reverted.forEach((m) => console.log(`  ✓ ${m.name}`));
        break;
      }

      case 'down:all': {
        console.log('Rolling back ALL migrations...');
        const reverted = await migrator.down({ to: 0 });
        console.log(`Successfully rolled back all migrations (${reverted.length} reverted).`);
        break;
      }

      case 'status': {
        const executed = await migrator.executed();
        const pending = await migrator.pending();
        console.log(`\nExecuted migrations (${executed.length}):`);
        executed.forEach((m) => console.log(`  [X] ${m.name}`));
        console.log(`\nPending migrations (${pending.length}):`);
        pending.forEach((m) => console.log(`  [ ] ${m.name}`));
        break;
      }

      case 'seed': {
        console.log('Executing database seeders...');
        const executed = await seeder.up();
        console.log(`Successfully executed ${executed.length} seeder(s):`);
        executed.forEach((s) => console.log(`  ✓ ${s.name}`));
        break;
      }

      case 'seed:undo': {
        console.log('Rolling back last seeder...');
        const reverted = await seeder.down();
        console.log(`Successfully rolled back ${reverted.length} seeder(s).`);
        break;
      }

      case 'seed:undo:all': {
        console.log('Rolling back ALL seeders...');
        const reverted = await seeder.down({ to: 0 });
        console.log(`Successfully rolled back all seeders (${reverted.length} reverted).`);
        break;
      }

      default:
        console.error(`Unknown command: ${command}`);
        console.log('Available commands: up, down, down:all, status, seed, seed:undo, seed:undo:all');
        process.exit(1);
    }
    process.exit(0);
  } catch (error) {
    logger.error('Migration/Seeder execution failed:', { error });
    process.exit(1);
  }
};

run();
