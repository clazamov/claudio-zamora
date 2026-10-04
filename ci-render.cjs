const fs = require('node:fs');
if (!process.env.APP_API_KEY || !process.env.DOCKER_IMAGE) throw new Error('Falta API_KEY o imagen');
let text = fs.readFileSync('Laboratorio3.yaml', 'utf8');
// El Namespace se aplica una sola vez con la configuración inicial de RBAC.
text = text.split('---\n').slice(1).join('---\n');
text = text.replace('__IMAGE__', process.env.DOCKER_IMAGE)
           .replace('__API_KEY_BASE64__', Buffer.from(process.env.APP_API_KEY).toString('base64'));
fs.writeFileSync('.rendered.yaml', text, {mode: 0o600});
