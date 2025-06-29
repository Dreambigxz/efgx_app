const fs = require('fs');
const path = require('path');
const packageJson = require('../package.json');

const versionName = packageJson.version;
const versionCode = versionName.split('.')
  .map((num, i) => num.padStart(2, '0'))
  .join(''); // e.g. 1.2.3 → 010203 → 10203

const gradleFilePath = path.join(__dirname, '../android/app/build.gradle');
let gradleFile = fs.readFileSync(gradleFilePath, 'utf8');

// Replace versionName and versionCode
gradleFile = gradleFile.replace(/versionCode\s+\d+/, `versionCode ${parseInt(versionCode, 10)}`);
gradleFile = gradleFile.replace(/versionName\s+["'][^"']+["']/, `versionName "${versionName}"`);

fs.writeFileSync(gradleFilePath, gradleFile);
console.log(`✅ Updated Android version to ${versionName} (${versionCode})`);
