import { ServerResponse } from "http";
import { ParsedUrlQuery } from "querystring";
import { AuthCode } from "../models/auth_code";
import { User } from "../models/user";
import { Context } from '../index'

const ISSUER = 'http://localhost:3000'

export const postLogin = (db: Context, query: ParsedUrlQuery, params: URLSearchParams, res: ServerResponse) => {
  const redirectUri = query.redirect_uri;
  const scope = query.scope;
  const clientId = query.client_id;
  const state = query.state;
  const nonce = query.nonce;
  const email = params.get('email')
  const password = params.get('password')
  res.writeHead(200, { 'Content-Type': 'application/json' });
  if (email && password && User.login(db.users, email, password)) {
    const user = User.findByEmail(db.users, email) as User;
    const authCode = AuthCode.build(user.id, clientId as string, redirectUri as string);
    const authCodeIndex = db.authCodes.findIndex((code) => code.userId === user.id)
    // NOTE: 同じユーザーに対するauthCodeがあれば上書き
    if (authCodeIndex === -1) {
      db.authCodes = [...db.authCodes, authCode];
    } else {
      db.authCodes[authCodeIndex] = authCode;
    }
    console.log(db.authCodes)
    res.writeHead(302, { 'Location': `${redirectUri}?code=${authCode.code}&iss=${ISSUER}&scope=${scope}&state=${state}&nonce=${nonce}` });
    res.end();
  } else {
    const response = { error: 'Unauthorized', data: null }
    res.end(JSON.stringify(response));
  }
}