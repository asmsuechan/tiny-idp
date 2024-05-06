import { ServerResponse } from "http";
import { User } from "../models/user";
import { Context } from "../models/context";
import { AuthCode } from "../models/auth_code";

export const login = (
  db: Context,
  query: URLSearchParams,
  params: URLSearchParams,
  res: ServerResponse
) => {
  const email = params.get("email");
  const password = params.get("password");

  const redirectUri = query.get("redirect_uri");
  const scope = query.get("scope");
  const clientId = query.get("client_id");
  const state = query.get("state");
  const nonce = query.get("nonce");
  const issuer = "http://localhost:3000";

  if (email && password && User.login(db.users, email, password)) {
    const user = User.findByEmail(db.users, email) as User;
    const authCode = AuthCode.build(
      user.id,
      clientId as string,
      redirectUri as string,
      (nonce as string) || null
    );
    authCode.save(db.authCodes);
    res.writeHead(302, {
      Location: `${redirectUri}?code=${authCode.code}&iss=${issuer}&scope=${scope}&state=${state}`,
    });
    res.end();
  } else {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Unauthorized" }));
  }
};
