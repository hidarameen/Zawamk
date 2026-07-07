const fs = require('fs');
const path = require('path');

function walk(dir, done) {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
}

walk('/home/u0_a398/MusicApp/client/src/app', (err, files) => {
  files.filter(f => f.endsWith('.tsx')).forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Remove grid-cols-1 so that the default is grid-cols-2 on mobile
    const patterns = [
      { search: 'grid-cols-1 sm:grid-cols-2', replace: 'grid-cols-2' }
    ];

    patterns.forEach(p => {
      if (content.includes(p.search)) {
        content = content.split(p.search).join(p.replace);
        changed = true;
      }
    });

    if (changed) {
      fs.writeFileSync(file, content);
    }
  });
});
