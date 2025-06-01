import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";

const credential = new DefaultAzureCredential();
const vaultUrl = "https://lintlordvault.vault.azure.net/";
const client = new SecretClient(vaultUrl, credential);

export async function loadGitHubSecrets() {
  const [appId, privateKey, installationId, openAiApiKey] = await Promise.all([
    client.getSecret("GITHUB-APP-ID"),
    client.getSecret("GITHUB-APP-PRIVATE-KEY"),
    client.getSecret("GITHUB-INSTALLATION-ID"),
    client.getSecret("OPENAI-API-KEY")
  ]);

  return {
    appId: appId.value!,
    privateKey: privateKey.value!,
    installationId: parseInt(installationId.value!),
    openAiApiKey: openAiApiKey.value!
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
