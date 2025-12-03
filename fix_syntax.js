const fs = require('fs');  
const content = fs.readFileSync('src/types/index.ts', 'utf8');  
const corrected = content.replace(/total_mecanicos: number;`n/g, '  total_mecanicos: number;\\n  ');  
fs.writeFileSync('src/types/index.ts', corrected);  
console.log('Corre‡Æo aplicada');  
