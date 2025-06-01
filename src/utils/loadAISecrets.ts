import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";

const credential = new DefaultAzureCredential();
const vaultUrl = "https://lintlordvault.vault.azure.net";
const client = new SecretClient(vaultUrl, credential);

export async function loadAISecrets(modelVersion: string) {
  const [endpoint, deployment, version] = await Promise.all([
    client.getSecret(modelVersion === "40" ? "AZURE-OPENAI-ENDPOINT" : "AZURE-OPENAI-ENDPOINT-41"),
    client.getSecret(modelVersion === "40" ? "AZURE-OPENAI-DEPLOYMENT" : "AZURE-OPENAI-DEPLOYMENT-41"),
    client.getSecret(modelVersion === "40" ? "AZURE-OPENAI-API-VERSION" : "AZURE-OPENAI-API-VERSION-41"),
  ]);

  return {
    endpoint: endpoint.value!,
    deployment: deployment.value!,
    apiVersion: version.value!,
  };
}
