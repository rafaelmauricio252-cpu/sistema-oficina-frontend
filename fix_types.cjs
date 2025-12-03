const fs = require('fs');  
const filePath = 'src/types/index.ts';  
let content = fs.readFileSync(filePath, 'utf8');  
content = content.replace(/total_mecanicos: number;`n/g, '  total_mecanicos: number;\\n  ');  
fs.writeFileSync(filePath, content);  
console.log('Corre‡Æo aplicada!');  
