#!/usr/bin/env node

/**
 * Script de migration React Router v5 → v6 pour Ionic 8
 * 
 * Changements automatiques :
 * 1. Redirect → Navigate
 * 2. useHistory → useNavigate + history.push() → navigate()
 * 3. <Route exact path="..."><Component /></Route> → <Route path="..." element={<Component />} />
 * 4. useParams<Type>() → useParams() (v6 gère automatiquement les types)
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// Patterns de migration
const migrations = [
  // 1. Imports
  {
    pattern: /import\s*{\s*([^}]*)\bRedirect\b([^}]*)\s*}\s*from\s*['"]react-router-dom['"]/g,
    replacement: (match, before, after) => {
      const imports = (before + after).split(',').map(i => i.trim()).filter(Boolean);
      const newImports = imports
        .filter(i => i !== 'Redirect')
        .concat(['Navigate'])
        .filter((v, i, a) => a.indexOf(v) === i); // unique
      return `import { ${newImports.join(', ')} } from 'react-router-dom'`;
    }
  },
  {
    pattern: /import\s*{\s*([^}]*)\buseHistory\b([^}]*)\s*}\s*from\s*['"]react-router-dom['"]/g,
    replacement: (match, before, after) => {
      const imports = (before + after).split(',').map(i => i.trim()).filter(Boolean);
      const newImports = imports
        .filter(i => i !== 'useHistory')
        .concat(['useNavigate'])
        .filter((v, i, a) => a.indexOf(v) === i);
      return `import { ${newImports.join(', ')} } from 'react-router-dom'`;
    }
  },
  
  // 2. useHistory → useNavigate
  {
    pattern: /const\s+(\w+)\s*=\s*useHistory\(\)/g,
    replacement: 'const $1 = useNavigate()'
  },
  
  // 3. history.push() → navigate()
  {
    pattern: /(\w+)\.push\(([^)]+)\)/g,
    replacement: '$1($2)'
  },
  
  // 4. history.replace() → navigate(..., { replace: true })
  {
    pattern: /(\w+)\.replace\(([^)]+)\)/g,
    replacement: '$1($2, { replace: true })'
  },
  
  // 5. <Redirect to="..." /> → <Navigate to="..." replace />
  {
    pattern: /<Redirect\s+to=["']([^"']+)["']\s*\/>/g,
    replacement: '<Navigate to="$1" replace />'
  },
  
  // 6. Supprimer exact des Route
  {
    pattern: /(<Route)\s+exact\s+(path=)/g,
    replacement: '$1 $2'
  },
  
  // 7. <Route path="..."><Component /></Route> → <Route path="..." element={<Component />} />
  {
    pattern: /<Route\s+path=["']([^"']+)["']>\s*<(\w+)\s*\/>\s*<\/Route>/g,
    replacement: '<Route path="$1" element={<$2 />} />'
  },
  
  // 8. <Route path="...">{ children }</Route> → <Route path="..." element={children} />
  // (Plus complexe, nécessite traitement manuel)
];

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  migrations.forEach(({ pattern, replacement }) => {
    const newContent = typeof replacement === 'function'
      ? content.replace(pattern, replacement)
      : content.replace(pattern, replacement);
    
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Migrated: ${filePath}`);
    return true;
  }
  
  return false;
}

function walkDir(dir) {
  let migratedCount = 0;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      migratedCount += walkDir(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      if (migrateFile(filePath)) {
        migratedCount++;
      }
    }
  });
  
  return migratedCount;
}

console.log('🚀 Starting React Router v5 → v6 migration for Ionic 8...\n');

const migratedCount = walkDir(srcDir);

console.log(`\n✅ Migration complete! ${migratedCount} files modified.`);
console.log('\n⚠️  Manual review required for:');
console.log('   - Complex Route children (not just <Component />)');
console.log('   - useParams<Type>() - remove type parameter');
console.log('   - matchPath() usage');
console.log('\n📖 Run: npm run build');
