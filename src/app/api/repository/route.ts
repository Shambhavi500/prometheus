import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const dirPath = searchParams.get('path') || '';

  const basePath = path.join(process.cwd(), 'public', 'repository', 'project-meghdoot-epc-package', 'project-meghdoot');

  if (action === 'tree') {
    try {
      const getTree = (currentPath: string): any => {
        const fullPath = path.join(basePath, currentPath);
        if (!fs.existsSync(fullPath)) return [];

        const items = fs.readdirSync(fullPath, { withFileTypes: true });
        return items.map((item) => {
          const itemPath = path.join(currentPath, item.name);
          if (item.isDirectory()) {
            return {
              type: 'directory',
              name: item.name,
              path: itemPath,
              children: getTree(itemPath),
            };
          } else {
            return {
              type: 'file',
              name: item.name,
              path: itemPath,
            };
          }
        });
      };

      const tree = getTree('');
      return NextResponse.json({ tree });
    } catch (e) {
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  }

  if (action === 'cross-refs') {
    try {
      const csvPath = path.join(process.cwd(), 'public', 'repository', '_cross-reference-index.csv');
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      
      const lines = csvContent.split('\n').filter(l => l.trim().length > 0);
      const headers = lines[0].split(',');
      const rows = lines.slice(1).map(line => {
        const cols = line.split(',');
        return {
          source_doc: cols[0],
          relationship: cols[1],
          target_doc_or_entity: cols[2],
          note: cols.slice(3).join(',')
        };
      });

      return NextResponse.json({ crossRefs: rows });
    } catch (e) {
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  }

  if (action === 'file') {
    try {
      if (!dirPath) return NextResponse.json({ error: 'Missing path' }, { status: 400 });
      const fullPath = path.join(basePath, dirPath);
      
      // Ensure the requested path is within the basePath to prevent directory traversal
      if (!fullPath.startsWith(basePath)) {
         return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
      }

      if (!fs.existsSync(fullPath)) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }

      const content = fs.readFileSync(fullPath, 'utf-8');
      return NextResponse.json({ content });
    } catch (e) {
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
