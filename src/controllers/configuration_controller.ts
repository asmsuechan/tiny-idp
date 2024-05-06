import { ServerResponse } from "http";

export const getConfiguration = (res: ServerResponse) => {
  const configuration = {
    issuer: "http://localhost:3000/openid-connect",
    authorization_endpoint: "http://localhost:3000/openid-connect/auth",
    token_endpoint: "http://localhost:3000/openid-connect/token",
    jwks_uri: "http://localhost:3000/openid-connect/jwks",
    response_types_supported: ["code"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256"],
    scopes_supported: ["openid"],
    token_endpoint_auth_methods_supported: ["client_secret_post"],
    claims_supported: ["sub", "iss"],
  };
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(configuration));
};
