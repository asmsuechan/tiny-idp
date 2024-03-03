import http, { IncomingMessage, ServerResponse } from 'http';
import url from 'url';
import { User } from './models/user';
import { login } from './controllers/login_controller';
import { getAuth } from './controllers/auth_controller';
import { AuthCode } from './models/auth_code';

// NOTE: インメモリDBを初期化する
const users: User[] = [{ id: 1, email: 'tiny-idp@asmsuechan.com', password: 'p@ssw0rd', clientId: 'tiny-client' }];
const authCodes: AuthCode[] = [];
const db = {
  users,
  authCodes
};

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
  console.log(`[${new Date()}] ${req.url}`);

  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello tiny openid provider!');
  } else if (req.url?.split('?')[0] === '/login' && req.method === 'POST') {
    const query = url.parse(req.url, true).query;
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      const params = new URLSearchParams(body);
      login(db, query, params, res);
    });
  } else if (req.url?.split('?')[0] === '/openid-connect/auth' && (req.method === 'GET' || req.method === 'POST')) {
    const query = url.parse(req.url, true).query;
    getAuth(db, query, res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Page not found');
  }
});

server.listen(3000);
