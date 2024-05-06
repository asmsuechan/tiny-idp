import http, { IncomingMessage, ServerResponse } from "http";
import { User } from "./models/user";
import { AuthCode } from "./models/auth_code";
import { login } from "./controllers/login_controller";
import { getAuth } from "./controllers/auth_controller";

const users: User[] = [
  {
    id: 1,
    email: "tiny-idp@asmsuechan.com",
    password: "p@ssw0rd",
    clientId: "tiny-client",
  },
];
const authCodes: AuthCode[] = [];
const db = {
  users,
  authCodes,
};

const server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    console.log(`[${new Date()}] ${req.url}`);
    const url = new URL(req.url || "", `http://${req.headers.host}`);

    if (url.pathname === "/") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Hello tiny openid provider!");
    } else if (url.pathname === "/login" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        const params = new URLSearchParams(body);
        login(db, url.searchParams, params, res);
      });
    } else if (
      url.pathname === "/openid-connect/auth" &&
      (req.method === "GET" || req.method === "POST")
    ) {
      getAuth(db, url.searchParams, res);
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Page not found");
    }
  }
);

server.listen(3000);
