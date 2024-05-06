import crypto from "crypto";
import path from "path";
import fs from "fs";

type JwtPayload = {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  nonce: string;
};

type JwtHeader = {
  alg: string;
  typ: string;
  kid: string;
};

export class JwtService {
  get ONE_DAY(): number {
    return 60 * 60 * 24;
  }

  public generate(
    iss: string,
    aud: string,
    nonce: string,
    expDuration: number = this.ONE_DAY
  ): string {
    const strHeader = JSON.stringify(this.buildHeader("2024-03-10"));
    const encodedHeader = this.base64urlEncode(strHeader);
    const rawPayload = this.buildPayload(iss, aud, nonce, expDuration);
    const strPayload = JSON.stringify(rawPayload);
    const encodedPayload = this.base64urlEncode(strPayload);
    const signTarget = `${encodedHeader}.${encodedPayload}`;
    const signature = this.sign(signTarget);
    return `${signTarget}.${this.base64urlEncode(signature)}`;
  }

  private sign(target: string) {
    const privatePath = path.resolve("./keys/tiny_idp_private.pem");
    const privateKey = fs.readFileSync(privatePath, "utf8");

    const sign = crypto.createSign("RSA-SHA256");
    sign.update(target);
    return sign.sign(privateKey, "base64");
  }

  private buildHeader(kid: string): JwtHeader {
    return {
      alg: "RS256",
      typ: "JWT",
      kid: kid,
    };
  }

  private buildPayload(
    iss: string,
    aud: string,
    nonce: string,
    expDuration: number = this.ONE_DAY
  ): JwtPayload {
    const sub = Math.random().toString(16).slice(2);
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + expDuration;
    return { iss, sub, aud, exp, iat, nonce };
  }

  private base64urlEncode(input: string) {
    return Buffer.from(input)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  }
}
