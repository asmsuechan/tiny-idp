// https://datatracker.ietf.org/doc/html/rfc7517

import { ServerResponse } from 'http';
import fs from 'fs';
import { generateJwk } from '../services/jwk_service';

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
};

// https://datatracker.ietf.org/doc/html/rfc7517#section-5.1
type JWKSet = {
  keys: JWK[];
};

export const getJwks = (res: ServerResponse) => {
  const pem = fs.readFileSync('keys/tiny_idp_public.pem', 'utf8');
  // NOTE: JWKとしてデータを保存して公開鍵・秘密鍵・kidを紐づけた方がいいが、ここでは処理を簡単にするために固定値としている
  const jwk = generateJwk(pem);
  jwk.kid = '2024-03-10';
  jwk.alg = 'RS256';
  jwk.use = 'sig';
  if (!jwk.kty) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'failed to generate jwk' }));
  }
  // NOTE: tiny-idpはRS256のみで実装しているため、ここでは公開鍵1つしか公開しない
  const jwkSet: JWKSet = {
    keys: [jwk]
  };
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(jwkSet));
};
