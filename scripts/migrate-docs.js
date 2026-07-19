const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const moves = [
  { src: 'DECISIONS.md', dest: 'docs/ADR/ADR-001-project-structure.md' },
  { src: 'RUNNING_GUIDE.md', dest: 'docs/deployment/RUNNING_GUIDE.md' },
  { src: 'Prometheus_Master_referrence_document.md', dest: 'docs/research/Prometheus_Master_referrence_document.md' }
];

moves.forEach(({ src, dest }) => {
  const srcPath = path.join(root, src);
  const destPath = path.join(root, dest);
  
  if (fs.existsSync(srcPath)) {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.renameSync(srcPath, destPath);
    console.log(`Moved ${src} to ${dest}`);
  } else {
    console.log(`Skip: ${src} not found`);
  }
});
