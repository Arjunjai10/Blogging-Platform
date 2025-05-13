const fs = require('fs');
const path = require('path');

console.log('Running post-build fix to replace %PUBLIC_URL% placeholders...');

// Path to the build directory
const buildDir = path.join(__dirname, 'build');

// Find all HTML files in the build directory
const htmlFiles = fs.readdirSync(buildDir).filter(file => file.endsWith('.html'));

// Process each HTML file
htmlFiles.forEach(file => {
  const filePath = path.join(buildDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace all instances of %PUBLIC_URL% with empty string
  content = content.replace(/%PUBLIC_URL%\//g, '');
  
  // Write the modified content back to the file
  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${file}`);
});

console.log('Post-build fix completed successfully!');
