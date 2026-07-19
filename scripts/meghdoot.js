const fs = require('fs');
const path = require('path');

const repoPath = path.join(__dirname, 'public', 'repository');

// 1. Rename directories
const oldEpc = path.join(repoPath, 'project-prometheus-epc-package');
const newEpc = path.join(repoPath, 'project-meghdoot-epc-package');
if (fs.existsSync(oldEpc)) {
  fs.renameSync(oldEpc, newEpc);
}

const oldInner = path.join(newEpc, 'project-prometheus');
const newInner = path.join(newEpc, 'project-meghdoot');
if (fs.existsSync(oldInner)) {
  fs.renameSync(oldInner, newInner);
}

// 2. Recursive function to rename files and update content
function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else {
      // Process file content
      let content = fs.readFileSync(fullPath, 'utf-8');
      let original = content;
      
      // We want to replace "Project Prometheus" with "Project Meghdoot"
      // But we must be careful not to replace "PROMETHEUS" (the platform).
      content = content.replace(/Project Prometheus/g, 'Project Meghdoot');
      content = content.replace(/project-prometheus/g, 'project-meghdoot');
      content = content.replace(/Texas/g, 'Navi Mumbai, Maharashtra, India');
      content = content.replace(/Houston/g, 'Navi Mumbai');
      content = content.replace(/DH-1/g, 'NM-1');
      // For currency, the documents might have $ or USD.
      content = content.replace(/\$([\d,]+)/g, '₹$1');
      content = content.replace(/USD/g, 'INR');
      
      // File prefixes
      content = content.replace(/PRM-/g, 'MGD-');
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf-8');
      }
      
      // Rename file if it contains PRM-
      if (item.includes('PRM-')) {
        const newName = item.replace(/PRM-/g, 'MGD-');
        const newPath = path.join(dir, newName);
        fs.renameSync(fullPath, newPath);
      }
    }
  }
}

processDirectory(repoPath);

// Also we should run this across src files to catch hardcoded "Project Prometheus"
function processSourceCode(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processSourceCode(fullPath);
    } else if (fullPath.match(/\.(tsx|ts|json)$/)) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      let original = content;
      
      content = content.replace(/Project Prometheus/g, 'Project Meghdoot');
      content = content.replace(/project-prometheus/g, 'project-meghdoot');
      content = content.replace(/Texas/g, 'Navi Mumbai, India');
      content = content.replace(/DH-1/g, 'NM-1');
      content = content.replace(/PRM-/g, 'MGD-');
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log('Updated src file:', fullPath);
      }
    }
  }
}

processSourceCode(path.join(__dirname, 'src'));

console.log('Meghdoot renaming complete.');
