import { Project, SyntaxKind } from 'ts-morph';

const project = new Project();
project.addSourceFilesAtPaths('/home/u0_a398/MusicApp/client/src/app/**/*.tsx');

const sourceFiles = project.getSourceFiles();

for (const sourceFile of sourceFiles) {
  const vars = sourceFile.getVariableDeclarations();
  let changed = false;

  for (const v of vars) {
    const initializer = v.getInitializer();
    if (initializer && initializer.getText().includes('useDataStore()')) {
      const nameNode = v.getNameNode();
      if (nameNode.getKind() === SyntaxKind.ObjectBindingPattern) {
        const elements = (nameNode as any).getElements();
        for (const el of elements) {
          const name = el.getName();
          // if it's one of the state arrays
          const arrs = ['albums', 'bands', 'poets', 'occasions', 'playlists', 'artists', 'news', 'videos', 'tracks', 'poems'];
          if (arrs.includes(name)) {
             // check if there's a shadowing useState
             const hasShadow = vars.some(otherV => {
                const otherInit = otherV.getInitializer();
                if (otherInit && otherInit.getText().includes('useState')) {
                  const otherNameNode = otherV.getNameNode();
                  if (otherNameNode.getKind() === SyntaxKind.ArrayBindingPattern) {
                    const firstEl = (otherNameNode as any).getElements()[0];
                    if (firstEl && firstEl.getText() === name) {
                      return true;
                    }
                  }
                }
                return false;
             });

             if (hasShadow) {
                // Rename the destructured element to `name: storeName`
                const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
                el.replaceWithText(`${name}: store${capitalized}`);
                
                // Now replace the useState parameter
                for (const otherV of vars) {
                    const otherInit = otherV.getInitializer();
                    if (otherInit && otherInit.getText().includes('useState')) {
                        const callExpr = otherInit;
                        if (callExpr.getKind() === SyntaxKind.CallExpression) {
                           const args = (callExpr as any).getArguments();
                           if (args.length > 0 && args[0].getText() === name) {
                              args[0].replaceWithText(`store${capitalized}`);
                           }
                        }
                    }
                }
                changed = true;
             }
          }
        }
      }
    }
  }
  if (changed) {
    sourceFile.saveSync();
  }
}
console.log('Shadow fixing complete');
