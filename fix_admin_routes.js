const fs = require('fs');
const path = './server/src/routes/adminRoutes.ts';
let code = fs.readFileSync(path, 'utf8');

// Remove the global middleware
code = code.replace('router.use(authenticateToken, requireAdmin);', '');

// Add the middleware to each route
code = code.replace(/router\.(post|put|delete)\('([^']+)',\s*async\s*\(req,\s*res\)\s*=>\s*\{/g, "router.$1('$2', authenticateToken, requireAdmin, async (req, res) => {");

// Also there's GET /users
code = code.replace(/router\.get\('([^']+)',\s*async\s*\(req,\s*res\)\s*=>\s*\{/g, "router.get('$1', authenticateToken, requireAdmin, async (req, res) => {");

fs.writeFileSync(path, code);
console.log('Fixed adminRoutes.ts');
