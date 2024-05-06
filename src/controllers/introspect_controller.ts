// https://datatracker.ietf.org/doc/html/rfc7662
import { ServerResponse } from "http";
import { Context } from "../models/context";

export const postIntrospect = (
  db: Context,
  params: URLSearchParams,
  res: ServerResponse
) => {
  const accessToken = params.get("token");
  const foundToken = db.accessTokens.find((ac) => {
    return ac.token === accessToken;
  });
  if (!foundToken || foundToken.expiresAt < new Date().getTime()) {
    res.writeHead(401, { "Content-Type": "application/json" });
    const response = { active: false };
    res.end(JSON.stringify(response));
    return;
  }
  res.writeHead(200, { "Content-Type": "application/json" });
  const response = { active: true };
  res.end(JSON.stringify(response));
};
