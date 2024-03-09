import { AccessToken } from '../models/access_token';
import { AuthCode } from '../models/auth_code';
import { Client } from '../models/client';
import { Context } from '../models/context';
import { ServerResponse } from 'http';
import { JwtService } from '../services/jwt_service';

// https://openid.net/specs/openid-connect-core-1_0.html#TokenResponse
// https://openid-foundation-japan.github.io/rfc6749.ja.html#anchor25
type ResponseData = {
  id_token: string;
  access_token: string;
  token_type: string;
  expires_in: number;
};

// https://openid.net/specs/openid-connect-core-1_0.html#TokenRequest
// https://openid-foundation-japan.github.io/rfc6749.ja.html#token-req
type RequestParams = {
  grantType: string | null;
  code: string | null;
  redirectUri: string | null;
  clientId: string | null;
  clientSecret: string | null;
};

// https://openid.net/specs/openid-connect-core-1_0.html#TokenErrorResponse
// https://openid-foundation-japan.github.io/rfc6749.ja.html#token-errors
type TokenError =
  | 'invalid_request'
  | 'invalid_client'
  | 'invalid_grant'
  | 'unauthorized_client'
  | 'unsupported_grant_type'
  | 'invalid_scope';
type ErrorResponse = {
  error: TokenError;
  error_description?: string;
  error_uri?: string;
};

// > 空の値で送信されたパラメーターは省略されたものとして扱われなければならない (MUST).
// > 認可サーバーは未知のリクエストパラメーターは無視しなければならない (MUST).
// > リクエストおよびレスポンスパラメーターは重複を許さない (MUST NOT).
// > https://openid-foundation-japan.github.io/rfc6749.ja.html#anchor23
export const postToken = (db: Context, params: URLSearchParams, res: ServerResponse) => {
  const grantType = params.get('grant_type');
  const clientId = params.get('client_id');
  const code = params.get('code');
  const redirectUri = params.get('redirect_uri');
  const clientSecret = params.get('client_secret');
  const requestParams: RequestParams = { grantType, code, redirectUri, clientId, clientSecret };
  const client = db.clients.find((c) => c.clientId === clientId);
  // NOTE: 未使用の認可コードを見つけてくる
  const authCode = db.authCodes.find((ac) => {
    return ac.code === code && ac.clientId === clientId && ac.expiresAt > new Date();
  });

  const validated = validate(requestParams, authCode, client);
  if (validated) {
    res.writeHead(400, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', Pragma: 'no-cache' });
    const response: ErrorResponse = { error: validated };
    res.end(JSON.stringify(response));
    return;
  }

  // NOTE: 一度使用した認可コードには使用済み日時を入れる
  // 後ほど使用済みであればエラーにするようバリデーションを追加する
  authCode!.usedAt = new Date();
  authCode!.save(db.authCodes);

  const accessToken = AccessToken.build(authCode!.userId);
  accessToken.save(db.accessTokens);

  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    Pragma: 'no-cache'
  });
  const jwtService = new JwtService();
  const jwt = jwtService.generate('http://localhost:3000', 'tiny-client');
  const data: ResponseData = {
    id_token: jwt,
    access_token: accessToken.token,
    token_type: 'Bearer',
    expires_in: 86400
  };
  res.end(JSON.stringify(data));
};

// https://openid.net/specs/openid-connect-core-1_0.html#TokenRequestValidation
// https://openid-foundation-japan.github.io/rfc6749.ja.html#token-errors
// 実装しない仕様
// * Authorization リクエストヘッダーでの認証
const validate = (requestParams: RequestParams, authCode?: AuthCode, client?: Client): TokenError | null => {
  if (!requestParams.clientId || !requestParams.code || !requestParams.grantType || !requestParams.redirectUri) {
    return 'invalid_request';
  }
  if (requestParams.grantType !== 'authorization_code') {
    return 'unsupported_grant_type';
  }
  // https://openid-foundation-japan.github.io/rfc6749.ja.html#code-authz-resp
  if (!authCode || authCode.usedAt || authCode.redirectUri !== requestParams.redirectUri) {
    return 'invalid_grant';
  }
  if (!client || client.clientSecret !== requestParams.clientSecret) {
    return 'invalid_client';
  }

  return null;
};
