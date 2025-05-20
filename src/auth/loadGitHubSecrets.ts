import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";

const credential = new DefaultAzureCredential();
const vaultUrl = "https://lintlordvault.vault.azure.net/";
const client = new SecretClient(vaultUrl, credential);

export async function loadGitHubSecrets() {
  const [appId, privateKey, installationId] = await Promise.all([
    client.getSecret("GITHUB-APP-ID"),
    client.getSecret("GITHUB-APP-PRIVATE-KEY"),
    client.getSecret("GITHUB-INSTALLATION-ID")
  ]);

  return {
    appId: appId.value!,
    privateKey: privateKey.value!,
    installationId: parseInt(installationId.value!)
  };
}

export async function loadGitHubPem(): Promise<string> {
  const secret = await client.getSecret("GITHUB-APP-PRIVATE-KEY");
  return secret.value || "";
}

export async function loadGitHubAppId(): Promise<string> {
  const secret = await client.getSecret("GITHUB-APP-ID");
  return secret.value || "";
}
