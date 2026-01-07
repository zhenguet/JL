const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..');
const QUIZ_DIR = path.join(BASE_DIR, 'data', 'quiz');

function main() {
  const files = fs.readdirSync(QUIZ_DIR);
  const setFiles = files.filter((f) => f.match(/quiz\d+_set\d+\.json$/));

  if (setFiles.length === 0) {
    console.log('No old set files found.');
    return;
  }

  console.log(`Found ${setFiles.length} old set files to delete.`);
  console.log('\nFiles to be deleted:');
  setFiles.slice(0, 20).forEach((file) => {
    console.log(`  - ${file}`);
  });
  if (setFiles.length > 20) {
    console.log(`  ... and ${setFiles.length - 20} more files`);
  }

  console.log('\n⚠️  This will permanently delete these files!');
  console.log('Run with: node scripts/cleanup_old_sets.js --confirm to proceed.');

  if (process.argv.includes('--confirm')) {
    let deleted = 0;
    setFiles.forEach((file) => {
      const filePath = path.join(QUIZ_DIR, file);
      try {
        fs.unlinkSync(filePath);
        deleted++;
      } catch (error) {
        console.error(`Error deleting ${file}: ${error.message}`);
      }
    });
    console.log(`\n✅ Deleted ${deleted} files.`);
  } else {
    console.log('\nNo files were deleted. Re-run with --confirm to delete them.');
  }
}

main();
