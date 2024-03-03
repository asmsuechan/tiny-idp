import { Client } from './client';
import { AccessToken } from './access_token';
import { AuthCode } from './auth_code';
import { User } from './user';

export type Context = {
  users: User[];
  authCodes: AuthCode[];
  accessTokens: AccessToken[];
  clients: Client[];
};
