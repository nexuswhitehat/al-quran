const fs = require('fs');
const file = fs.readFileSync('./ne/1.json', 'utf8');
console.log(file.slice(0, 10).split('').map(c => c.charCodeAt(0)));
