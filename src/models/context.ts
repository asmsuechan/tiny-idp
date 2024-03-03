import { AuthCode } from './auth_code';
import { User } from './user';

export type Context = {
  users: User[];
  authCodes: AuthCode[];
};
