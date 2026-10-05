const fs = require('node:fs');
if (!['production', 'develop'].includes(process.env.APP_AMBIENTE)) throw new Error('AMBIENTE inválido');
if (!process.env.DOCKER_IMAGE) throw new Error('Falta la imagen');
let text = fs.readFileSync('Laboratorio3.yaml', 'utf8');
// Namespace creado por la configuración inicial; no se modifica el Secret.
text = text.split('---\n').slice(1).join('---\n');
text = text.replace(/image: docker\.io\/clazamov\/claudiozamora:claudio-zamora/, 'image: ' + process.env.DOCKER_IMAGE);
text = text.replace('AMBIENTE: develop', 'AMBIENTE: ' + process.env.APP_AMBIENTE);
fs.writeFileSync('.rendered.yaml', text, {mode: 0o600});
