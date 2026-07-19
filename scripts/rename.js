const fs = require('fs');
const path = require('path');

const repoPath = path.join(__dirname, 'public', 'repository');

// 1. Rename directories
const oldEpc = path.join(repoPath, 'project-aquila-epc-package');
const newEpc = path.join(repoPath, 'project-prometheus-epc-package');
if (fs.existsSync(oldEpc)) {
  fs.renameSync(oldEpc, newEpc);
}

const oldInner = path.join(newEpc, 'project-aquila');
const newInner = path.join(newEpc, 'project-prometheus');
if (fs.existsSync(oldInner)) {
  fs.renameSync(oldInner, newInner);
}

// 2. Recursive function to rename files and update content
function processDirectory(dir) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else {
      // Process file content
      let content = fs.readFileSync(fullPath, 'utf-8');
      
      // Replace content: TVASHTA -> PROMETHEUS, Aquila -> Prometheus, AQL -> PRM
      content = content.replace(/TVASHTA/g, 'PROMETHEUS');
      content = content.replace(/Project Aquila/gi, 'Project Prometheus');
      content = content.replace(/Aquila/gi, 'Prometheus');
      content = content.replace(/AQL/g, 'PRM');
      
      fs.writeFileSync(fullPath, content, 'utf-8');
      
      // Rename file if it contains AQL
      if (item.includes('AQL-')) {
        const newName = item.replace(/AQL-/g, 'PRM-');
        const newPath = path.join(dir, newName);
        fs.renameSync(fullPath, newPath);
      }
    }
  }
}

// Also process files at the root of public/repository
processDirectory(repoPath);

console.log('Renaming and content replacement complete.');
