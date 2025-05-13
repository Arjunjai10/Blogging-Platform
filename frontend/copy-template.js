const fs = require('fs');
const path = require('path');

console.log('Copying template.html to index.html...');

// Path to the template and index files
const templatePath = path.join(__dirname, 'public', 'template.html');
const indexPath = path.join(__dirname, 'public', 'index.html');

// Read the template file
const templateContent = fs.readFileSync(templatePath, 'utf8');

// Write the template content to the index.html file
fs.writeFileSync(indexPath, templateContent);

console.log('Successfully copied template.html to index.html!');
