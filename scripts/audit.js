const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            callback(path.join(dir, f));
        }
    });
}

const allFiles = [];
walkDir(path.join(__dirname, '../src'), (filePath) => {
    allFiles.push(filePath);
});
fs.writeFileSync(path.join(__dirname, '../audit_files.json'), JSON.stringify(allFiles, null, 2));
console.log('Audit complete. Total files: ' + allFiles.length);
