// https://datatracker.ietf.org/doc/html/rfc7662
import { ServerResponse } from 'http';
import { Context } from '../index';

export const postIntrospect = (db: Context, params: URLSearchParams, res: ServerResponse) => {
  const accessToken = params.get('token');
  const foundToken = db.accessTokens.find((ac) => ac.token === accessToken);
  if (!foundToken || foundToken.expiresIn < new Date().getTime()) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    const response = { active: false };
    res.end(JSON.stringify(response));
    return;
  }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  const response = { active: true };
  res.end(JSON.stringify(response));
};
