const ONE_DAY = 60 * 60 * 24;
export class AccessToken {
  token: string;
  expiresIn: number;
  userId: number;

  constructor(token: string, expiresIn: number, userId: number) {
    this.token = token;
    this.expiresIn = expiresIn;
    this.userId = userId;
  }

  static build(userId: number) {
    const token = Math.random().toString(36).slice(-8);
    const expiresIn = ONE_DAY;
    return new AccessToken(token, expiresIn, userId);
  }

  save(db: AccessToken[]) {
    if (db.some((at) => at.userId === this.userId)) {
      db.splice(
        db.findIndex((at) => at.userId === this.userId),
        1
      );
    } else {
      db.push(this);
    }
  }

  isValid() {
    return this.expiresIn > Date.now();
  }
}
