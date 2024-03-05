export class AuthCode {
  code: string;
  userId: number;
  clientId: string;
  expiresAt: Date;
  usedAt: Date | null = null;
  redirectUri: string;

  constructor(code: string, userId: number, clientId: string, expiresAt: Date, redirectUri: string) {
    this.code = code;
    this.userId = userId;
    this.clientId = clientId;
    this.expiresAt = expiresAt;
    this.redirectUri = redirectUri;
  }

  static build(userId: number, clientId: string, redirectUri: string) {
    const code = Math.random().toString(36).slice(-8);
    const oneMin = 1 * 60 * 1000;
    const expiresAt = new Date(Date.now() + oneMin);
    const authCode = new AuthCode(code, userId, clientId, expiresAt, redirectUri);
    return authCode;
  }

  // 既存レコードがあれば上書きし、なければ新規に保存する
  save(db: AuthCode[]) {
    if (db.some((ac) => ac.code === this.code)) {
      db = db.splice(
        db.findIndex((ac) => ac.code === this.code),
        1
      );
    } else {
      db.push(this);
    }
  }
}
