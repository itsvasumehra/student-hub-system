const fs = require('fs');
const path = require('path');

function walk(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        walk(path.join(dir, file), fileList);
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        fileList.push(path.join(dir, file));
      }
    }
  }
  return fileList;
}

const allFiles = [...walk('app'), ...walk('hooks'), ...walk('lib')];

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // 1. In API routes: catch (error: any) { return NextResponse.json({ error: error.message }, { status: ... }) }
  const catchRegex = /catch\s*\(\s*error\s*:\s*any\s*\)\s*\{\s*return\s*NextResponse\.json\(\{\s*error\s*:\s*error\.message\s*\}\s*,\s*\{\s*status\s*:\s*(\d+)\s*\}\)\s*\}/g;
  if (catchRegex.test(content)) {
    content = content.replace(catchRegex, (match, status) => {
      return `catch (error: unknown) {\n    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: ${status} })\n  }`;
    });
    changed = true;
  }

  // 2. catch (err: any) with return { success: false, error: err.message }
  const catchErrRegex = /catch\s*\(\s*err\s*:\s*any\s*\)\s*\{\s*return\s*\{\s*success\s*:\s*false\s*,\s*error\s*:\s*err\.message\s*\}\s*\}/g;
  if (catchErrRegex.test(content)) {
    content = content.replace(catchErrRegex, () => {
       return `catch (err: unknown) {\n      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }\n    }`;
    });
    changed = true;
  }

  // 3. catch (err: any) with alert(`Error: ${err.message}`)
  const catchAlertRegex = /catch\s*\(\s*err\s*:\s*any\s*\)\s*\{\s*alert\(\`(.*?)\s*\$\{\s*err\.message\s*\}\`\)\s*\}/g;
  if (catchAlertRegex.test(content)) {
    content = content.replace(catchAlertRegex, (match, prefix) => {
       return `catch (err: unknown) {\n      if (err instanceof Error) alert(\`${prefix} \${err.message}\`)\n      else alert(\`${prefix} Unknown error\`)\n    }`;
    });
    changed = true;
  }

  // 4. (a.subjects as any)?.code
  const subjectCastRegex = /\(a\.subjects as any\)/g;
  if (subjectCastRegex.test(content)) {
    content = content.replace(subjectCastRegex, '(a.subjects as { code: string; name: string })');
    changed = true;
  }

  // 5. any[] -> unknown[] in specific places if needed, but let's just do catch (error: any) { ... }
  // Generic catch (error: any) -> catch (error: unknown)
  // But ONLY after the above safe replacements! We have to be careful if error.message is still in the block.
  // Actually, let's also fix catch (error: any) { console.error(error.message) }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}
