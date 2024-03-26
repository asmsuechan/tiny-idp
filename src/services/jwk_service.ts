import crypto from 'crypto';

export const generateJwk = (publicKeyPem: string) => {
  const publicKey = crypto.createPublicKey(publicKeyPem);
  return publicKey.export({ format: 'jwk' });
};
