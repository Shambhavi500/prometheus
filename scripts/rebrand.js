const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;
  for (const { regex, replace } of replacements) {
    content = content.replace(regex, replace);
  }
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Updated', filePath);
  }
}

function processDirectory(dir, replacements) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath, replacements);
    } else if (fullPath.match(/\.(tsx|ts|json)$/)) {
      replaceInFile(fullPath, replacements);
    }
  }
}

const replacements = [
  { regex: /TVASHTA/g, replace: 'PROMETHEUS' },
  { regex: /tvashta/g, replace: 'prometheus' },
  { regex: /Project Aquila/g, replace: 'Project Prometheus' },
  { regex: /project-aquila/g, replace: 'project-prometheus' },
  { regex: /Aquila/g, replace: 'Prometheus' },
  { regex: /AQL-/g, replace: 'PRM-' }
];

replaceInFile(path.join(__dirname, 'package.json'), replacements);
processDirectory(path.join(__dirname, 'src'), replacements);

console.log('Global rebranding complete.');
