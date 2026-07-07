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

    // Replace "grid-cols-2" with "grid-cols-1 sm:grid-cols-2" if not preceded by md: etc.
    const patterns = [
      { search: 'grid-cols-3 gap', replace: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap' },
      { search: 'grid-cols-4 gap', replace: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap' },
      { search: 'grid-cols-2 gap', replace: 'grid-cols-1 sm:grid-cols-2 gap' },
      { search: 'grid grid-cols-2', replace: 'grid grid-cols-1 sm:grid-cols-2' },
      { search: 'grid grid-cols-3', replace: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3' },
      { search: 'grid grid-cols-4', replace: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4' }
    ];

    patterns.forEach(p => {
      // only replace if not already part of a responsive string
      if (content.includes(p.search) && !content.includes(p.replace)) {
        content = content.split(p.search).join(p.replace);
        changed = true;
      }
    });

    if (changed) {
      fs.writeFileSync(file, content);
    }
  });
});
