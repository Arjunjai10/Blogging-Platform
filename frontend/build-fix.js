const fs = require('fs');
const path = require('path');

// Read the index.html file
const indexPath = path.join(__dirname, 'public', 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Replace all %PUBLIC_URL% placeholders with empty string (root path)
indexContent = indexContent.replace(/%PUBLIC_URL%/g, '');

// Write the updated content back to the file
fs.writeFileSync(indexPath, indexContent);

console.log('Successfully replaced %PUBLIC_URL% placeholders in index.html');
