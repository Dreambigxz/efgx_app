const fs = require('fs');
const path = require('path');
const packageJson = require('../package.json');

const version = packageJson.version;
const sourcePath = path.resolve(__dirname, '../android/app/build/outputs/apk/release/app-release.apk');
const targetPath = path.resolve(__dirname, `../android/app/build/outputs/apk/release/app-release-${version}.apk`);

if (!fs.existsSync(sourcePath)) {
  console.error('❌ APK not found. Did you build it first?');
  process.exit(1);
}

fs.copyFileSync(sourcePath, targetPath);
console.log(`✅ Renamed APK to: app-release-${version}.apk`);
