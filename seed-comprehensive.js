// Temporary script to run the comprehensive seed
const { exec } = require('child_process');

console.log('Running comprehensive seed...');
exec('npx tsx prisma/seed-new.ts', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(`Output: ${stdout}`);
  console.log('✅ Comprehensive seed completed!');
});
