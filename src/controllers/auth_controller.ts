import { ParsedUrlQuery } from 'querystring';
import { Context } from '../models/context';
import { ServerResponse } from 'http';
import fs from 'fs';

// https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest
// https://openid-foundation-japan.github.io/rfc6749.ja.html#code-authz-req
type QueryParams = {
  scope: string | string[] | undefined;
  responseType: string | string[] | undefined;
  clientId: string | string[] | undefined;
  redirectUri: string | string[] | undefined;
  state: string | string[] | undefined;
  nonce: string | string[] | undefined;
};

// https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1.2.1
// https://openid.net/specs/openid-connect-core-1_0.html#AuthCodeError
type AuthCodeError =
  | 'invalid_request'
  | 'unauthorized_client'
  | 'access_denied'
  | 'unsupported_response_type'
  | 'invalid_scope'
  | 'server_error'
  | 'temporarily_unavailable'
  | 'interaction_required'
  | 'login_required'
  | 'account_selection_required'
  | 'consent_required'
  | 'invalid_request_uri'
  | 'invalid_request_object'
  | 'request_not_supported'
  | 'request_uri_not_supported'
  | 'registration_not_supported';

type ErrorTarget = 'resourceOwner' | 'redirectUri';
type ValidateError = {
  authCodeError: AuthCodeError;
  target: ErrorTarget;
};

// https://openid.net/specs/openid-connect-core-1_0.html#AuthError
// https://openid-foundation-japan.github.io/rfc6749.ja.html#code-authz-error
type ErrorResponse = {
  error: AuthCodeError;
  error_description?: string;
  error_uri?: string;
};

export const getAuth = (db: Context, query: ParsedUrlQuery, res: ServerResponse) => {
  try {
    const scope = query.scope;
    const responseType = query.response_type;
    const clientId = query.client_id;
    const redirectUri = query.redirect_uri;
    const state = query.state;
    const nonce = query.nonce;
    const queryParams: QueryParams = { scope, responseType, clientId, redirectUri, state, nonce };
    const validated = validate(queryParams);
    if (validated) {
      const responseData: ErrorResponse = { error: validated.authCodeError };
      if (validated.target === 'redirectUri') {
        const response = new URLSearchParams(responseData).toString();
        res.writeHead(302, { 'Content-Type': 'application/x-www-form-urlencoded' });
        res.end(`${redirectUri}?${response}`);
      } else {
        // リソースオーナーは今操作している人である
        // ここのレスポンスは仕様がないためJSONを返す
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(responseData));
      }
      return;
    }

    const loginPage = fs.readFileSync('src/views/login.html', 'utf8');
    // NOTE: 簡易テンプレートエンジン
    let template = loginPage;
    template = template.replace(/{client_id}/g, String(clientId));
    template = template.replace(/{redirect_uri}/g, String(redirectUri));
    template = template.replace(/{scope}/g, String(scope));
    template = template.replace(/{state}/g, String(state));
    template = template.replace(/{nonce}/g, String(nonce));
    res.end(template);
  } catch (e) {
    // NOTE: エラー時はserver_errorを返すという仕様も決まっている
    // https://openid-foundation-japan.github.io/rfc6749.ja.html#code-authz-resp
    console.error(e);
    res.writeHead(500, { 'Content-Type': 'application/x-www-form-urlencoded' });
    const responseData: ErrorResponse = { error: 'server_error' };
    const response = new URLSearchParams(responseData).toString();
    res.end(response);
  }
};

// NOTE: エラーの返却先はリソースオーナーとredirect_uriの2種類ある
// > リクエストが, リダイレクトURIの欠落 / 不正 / ミスマッチによって失敗した場合, もしくはクライアント識別子が不正な場合は, 認可サーバーはリソースオーナーにエラーを通知すべきである (SHOULD). 不正なリダイレクトURIに対してユーザーエージェントを自動的にリダイレクトさせてはならない (MUST NOT).
// > リソースオーナーがアクセス要求を拒否した場合, もしくはリダイレクトURIの欠落や不正以外でリクエストが失敗した場合は, 認可サーバーは application/x-www-form-urlencoded (Appendix B) フォーマットを用いてリダイレクトURIのクエリーコンポーネントに次のようなパラメーターを付与してクライアントに返却する.
// https://openid-foundation-japan.github.io/rfc6749.ja.html#code-authz-resp
// https://openid.net/specs/openid-connect-core-1_0.html#AuthCodeError
const validate = (query: QueryParams): ValidateError | null => {
  const validRedirectUris = ['http://localhost:4000/oidc/callback'];
  const validClientIds = ['tiny-client'];
  const redirectUri = query.redirectUri;
  const clientId = query.clientId;
  const state = query.state;
  const nonce = query.nonce;
  if (
    !redirectUri ||
    Array.isArray(redirectUri) ||
    !validRedirectUris.includes(redirectUri) ||
    !clientId ||
    Array.isArray(clientId) ||
    !validClientIds.includes(clientId) ||
    !state ||
    Array.isArray(state) ||
    !nonce ||
    Array.isArray(nonce)
  ) {
    return { authCodeError: 'invalid_request', target: 'resourceOwner' };
  }

  const responseType = query.responseType;
  // NOTE: scopeの区切り文字はスペース
  const scope = query.scope;

  // NOTE: パラメーターがnullでない、かつ?client_id=a&client_id=bのように複数指定されていないことの確認
  // > リクエストに必須パラメーターが含まれていない, サポート外のパラメーターが付与されている, 同一のパラメーターが複数含まれる場合, その他不正な形式であった場合もこれに含まれる.
  // https://openid-foundation-japan.github.io/rfc6749.ja.html#code-authz-resp
  if (!responseType || !scope || Array.isArray(responseType) || Array.isArray(scope)) {
    return { authCodeError: 'invalid_request', target: 'redirectUri' };
  }

  const validResponseTypes = ['code'];
  if (!validResponseTypes.includes(responseType)) {
    return { authCodeError: 'unsupported_response_type', target: 'redirectUri' };
  }
  const validScopes = ['openid'];
  if (!validScopes.includes(scope)) {
    return { authCodeError: 'invalid_scope', target: 'redirectUri' };
  }
  return null;
};
