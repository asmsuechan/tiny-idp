import crypto from 'crypto';

export const generateJwk = (pem: string) => {
  const privateKey = crypto.createPrivateKey(pem);

  const publicKey = crypto.createPublicKey(privateKey);

  return publicKey.export({ format: 'jwk' });
};
