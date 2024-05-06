import { User } from "./user";
import { AuthCode } from "./auth_code";
import { AccessToken } from "./access_token";
import { Client } from "./client";

export type Context = {
  users: User[];
  authCodes: AuthCode[];
  accessTokens: AccessToken[];
  clients: Client[];
};
