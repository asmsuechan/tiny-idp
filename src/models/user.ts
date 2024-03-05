export class User {
  id: number;
  email: string;
  password: string;
  clientId: string;

  constructor(id: number, email: string, password: string, clientId: string) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.clientId = clientId;
  }

  static findByEmail(db: User[], email: string) {
    const result = db.find((u) => u.email === email);
    if (result) {
      return new User(result?.id, result?.email, result?.password, result?.clientId);
    } else {
      throw Error('User Not Found');
    }
  }

  static login(db: User[], email: string, password: string) {
    const user = db.find((u) => u.email === email && u.password === password);
    if (user) {
      return true;
    } else {
      return false;
    }
  }
}
