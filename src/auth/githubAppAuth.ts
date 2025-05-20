import jwt from "jsonwebtoken";
import { loadGitHubPem } from "./loadGitHubSecrets";

export async function generateGitHubAppJWT(appId: string): Promise<string> {
  const privateKey = await loadGitHubPem();
  const now = Math.floor(Date.now() / 1000);

  const payload = {
    iat: now - 60,
    exp: now + 600,
    iss: appId,
  };

  const token = jwt.sign(payload, privateKey, { algorithm: "RS256" });
  return token;
}
