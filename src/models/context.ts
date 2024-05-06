import { User } from "./user";
import { AuthCode } from "./auth_code";

export type Context = {
  users: User[];
  authCodes: AuthCode[];
};
