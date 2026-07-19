const fs = require('fs');
const path = require('path');

const emojiRegex = /[\p{Emoji_Presentation}\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}🚨]/gu;

function walk(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        filelist = walk(filepath, filelist);
      }
    } else if (['.ts', '.tsx', '.js', '.jsx'].includes(path.extname(filepath))) {
      filelist.push(filepath);
    }
  }
  return filelist;
}

const files = walk(path.join(__dirname, '../src'));
const results = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  let match;
  while ((match = emojiRegex.exec(content)) !== null) {
    const lines = content.substring(0, match.index).split('\n');
    const lineNum = lines.length;
    const lineContent = content.split('\n')[lineNum - 1];
    
    // ignore some symbols that might not be emojis but get caught
    if (['©', '®', '™'].includes(match[0])) continue;

    results.push({
      file: path.relative(path.join(__dirname, '..'), file),
      line: lineNum,
      emoji: match[0],
      context: lineContent.trim()
    });
  }
}

console.log(JSON.stringify(results, null, 2));
