import { Project, SyntaxKind } from 'ts-morph';
import * as path from 'path';

const project = new Project();
project.addSourceFilesAtPaths('/home/u0_a398/MusicApp/client/src/app/**/*.tsx');

const sourceFiles = project.getSourceFiles();

const storeMethods = [
  'getTrackById', 'getVideoById', 'getArtistById', 'getBandById',
  'getAlbumById', 'getPlaylistById', 'getNewsById', 'getOccasionById',
  'getTracksByArtistId', 'getAlbumsByArtistId', 'getVideosByArtistId',
  'getPoetById', 'getPoemById', 'getPoemsByPoetId', 'getPoemsByEra',
  'getPoemsByCategory', 'getTracksByType', 'getTracksByPoetId',
  'getTracksByOccasionId', 'getTracksByAlbumId', 'getTracksByBandId',
  'getVideosByOccasionId', 'getPoemsByOccasionId', 'getTopTracks',
  'getRecentTracks', 'getFeaturedNews', 'getRecentNews'
];

const mockVars = [
  'mockTracks', 'mockAlbums', 'mockArtists', 'mockPlaylists',
  'mockBands', 'mockPoets', 'mockPoems', 'mockNews',
  'mockOccasions', 'mockMusicVideos'
];

// Mapping from mockVar to store property name
const varMap: Record<string, string> = {
  'mockTracks': 'tracks',
  'mockAlbums': 'albums',
  'mockArtists': 'artists',
  'mockPlaylists': 'playlists',
  'mockBands': 'bands',
  'mockPoets': 'poets',
  'mockPoems': 'poems',
  'mockNews': 'news',
  'mockOccasions': 'occasions',
  'mockMusicVideos': 'videos'
};

for (const sourceFile of sourceFiles) {
  let needsStore = false;
  const importedMethods: string[] = [];
  const importedVars: string[] = [];
  const importedTypes: string[] = [];

  const importDeclarations = sourceFile.getImportDeclarations();
  for (const importDecl of importDeclarations) {
    const moduleSpecifier = importDecl.getModuleSpecifierValue();
    if (moduleSpecifier.includes('mockData')) {
      const namedImports = importDecl.getNamedImports();
      for (const namedImport of namedImports) {
        const name = namedImport.getName();
        if (storeMethods.includes(name)) importedMethods.push(name);
        else if (mockVars.includes(name)) importedVars.push(name);
        else importedTypes.push(name); // Track, Artist, etc.
      }
      // Remove the mockData import
      importDecl.remove();
      needsStore = true;
    }
  }

  if (needsStore) {
    // 1. Add type imports if any
    if (importedTypes.length > 0) {
      sourceFile.addImportDeclaration({
        moduleSpecifier: '../types', // We'll just use alias or relative, but let's assume it resolves roughly or we fix it.
        namedImports: importedTypes
      });
    }

    // 2. Add store import
    const storeHooks = [...importedMethods, ...importedVars.map(v => varMap[v])];
    if (storeHooks.length > 0) {
      // Try to figure out relative path to store
      // A generic way is just to use aliased imports if they exist. But wait, client doesn't have aliases configured.
      // We'll just use a generic relative path based on the file depth.
      const filePath = sourceFile.getFilePath();
      const relativeToSrc = path.relative(path.join('/home/u0_a398/MusicApp/client/src'), filePath);
      const depth = relativeToSrc.split(path.sep).length - 1;
      const prefix = depth === 0 ? './' : '../'.repeat(depth);
      
      sourceFile.addImportDeclaration({
        moduleSpecifier: `${prefix}app/store/dataStore`,
        namedImports: ['useDataStore']
      });

      // 3. Inject hook call inside the component
      // Find the main functional component (usually the default export or the one matching filename)
      const functions = sourceFile.getFunctions();
      let mainFunc = functions.find(f => f.isDefaultExport() || f.isExported());
      
      // If no function declaration, check variable statements (arrow functions)
      if (!mainFunc) {
         const variables = sourceFile.getVariableDeclarations();
         const defaultExport = sourceFile.getExportAssignment(e => !e.isExportEquals())?.getExpression();
      }

      if (mainFunc) {
        // Build the hook destructuring: const { tracks, getPoetById } = useDataStore();
        const hookCall = `const { ${storeHooks.join(', ')} } = useDataStore();`;
        mainFunc.insertStatements(0, hookCall);
      } else {
        // Fallback for arrow functions
        const defaultExport = sourceFile.getDefaultExportSymbol();
        if (defaultExport) {
          const valDec = defaultExport.getValueDeclaration();
          if (valDec && valDec.getKind() === SyntaxKind.FunctionDeclaration) {
             // already handled by getFunctions()
          } else if (valDec && valDec.getKind() === SyntaxKind.VariableDeclaration) {
             const initializer = (valDec as any).getInitializer();
             if (initializer && (initializer.getKind() === SyntaxKind.ArrowFunction || initializer.getKind() === SyntaxKind.FunctionExpression)) {
                 const block = initializer.getBody();
                 if (block.getKind() === SyntaxKind.Block) {
                     block.insertStatements(0, `const { ${storeHooks.join(', ')} } = useDataStore();`);
                 }
             }
          }
        }
      }

      // 4. Replace mock variables with store state
      for (const v of importedVars) {
        const replacement = varMap[v];
        // Replace occurrences of the variable
        const sourceText = sourceFile.getFullText();
        const regex = new RegExp(`\\b${v}\\b`, 'g');
        const newText = sourceText.replace(regex, replacement);
        sourceFile.replaceWithText(newText);
      }
    }
  }
}

project.saveSync();
console.log('Refactoring complete!');
