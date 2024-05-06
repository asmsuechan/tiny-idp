import http, { IncomingMessage, ServerResponse } from "http";
import { User } from "./models/user";
import { AuthCode } from "./models/auth_code";
import { AccessToken } from "./models/access_token";
import { login } from "./controllers/login_controller";
import { getAuth } from "./controllers/auth_controller";
import { postToken } from "./controllers/token_controller";
import { postIntrospect } from "./controllers/introspect_controller";
import { Client } from "./models/client";

const users: User[] = [
  {
    id: 1,
    email: "tiny-idp@asmsuechan.com",
    password: "p@ssw0rd",
    clientId: "tiny-client",
  },
];
const authCodes: AuthCode[] = [];
const accessTokens: AccessToken[] = [];
const clients: Client[] = [
  { clientId: "tiny-client", clientSecret: "c1!3n753cr37" },
];

const db = {
  users,
  authCodes,
  accessTokens,
  clients,
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
    } else if (
      url.pathname === "/openid-connect/token" &&
      req.method === "POST"
    ) {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        const params = new URLSearchParams(body);
        postToken(db, params, res);
      });
    } else if (
      url.pathname === "/openid-connect/introspect" &&
      req.method === "POST"
    ) {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        const params = new URLSearchParams(body);
        postIntrospect(db, params, res);
      });
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Page not found");
    }
  }
);

server.listen(3000);
