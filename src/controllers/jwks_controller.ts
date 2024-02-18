// https://datatracker.ietf.org/doc/html/rfc7517

import { ServerResponse } from "http";
import fs from 'fs'
import { generateJwk } from "../services/jwk_service";

// https://datatracker.ietf.org/doc/html/rfc7518#section-6.3.1
type JWK = {
  kty?: string; // https://datatracker.ietf.org/doc/html/rfc7517#section-4.1
  use?: string; // https://datatracker.ietf.org/doc/html/rfc7517#section-4.2
  kid?: string; // https://datatracker.ietf.org/doc/html/rfc7517#section-4.5
  key_ops?: string[];
  alg?: string;
  x5u?: string;
  x5c?: string[];
  x5t?: string;
  n?: string;
  e?: string;
}

// https://datatracker.ietf.org/doc/html/rfc7517#section-5.1
type JWKSet = {
  keys: JWK[];
}

export const getJwks = (res: ServerResponse) => {
  const privateKey = fs.readFileSync('keys/tiny_idp_private.pem', 'utf8')
  // NOTE: JWKとしてデータを保存して公開鍵・秘密鍵・kidを紐づけた方がいいが、ここでは手を抜いて固定値としている
  const jwk = generateJwk(privateKey)
  jwk.kid = '2011-04-29'
  jwk.alg = 'RS256'
  jwk.use = 'sig'
  if (!jwk.kty) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'failed to generate jwk' }));
  }
  const jwkSet: JWKSet = {
    keys: [
      jwk
    ]
  }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(jwkSet));
}