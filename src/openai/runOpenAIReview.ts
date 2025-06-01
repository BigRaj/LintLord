import { AzureClientOptions, AzureOpenAI } from "openai";
import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";
import { ExtractedFunction } from "../utils/extractFunctions";
import { loadAISecrets } from "../utils/loadAISecrets";

export async function runOpenAIReview(fn: ExtractedFunction): Promise<string> {
/*
  const modelVersion = "41";
  const { endpoint, deployment, apiVersion } = await loadAISecrets(modelVersion);

  // Azure AD token auth using managed identity
  const credential = new DefaultAzureCredential();
  const scope = "https://cognitiveservices.azure.com/.default";
  const tokenProvider = getBearerTokenProvider(credential, scope);

  const options: AzureClientOptions = {
    azureADTokenProvider: tokenProvider, 
    endpoint: endpoint,
    apiVersion: apiVersion
  }

  const client = new AzureOpenAI(options)
*/
const endpoint = "https://lintai.openai.azure.com/";
const modelName = "gpt-4.1-mini";
const deployment = "gpt-4.1-mini-reviewer";
const credential = new DefaultAzureCredential();
  const scope = "https://cognitiveservices.azure.com/.default";
  const azureADTokenProvider = getBearerTokenProvider(credential, scope);
  const apiVersion = "2024-04-01-preview";
  const options = { endpoint, azureADTokenProvider, deployment, apiVersion }

  const client = new AzureOpenAI(options);
  /*const result = await client.chat.completions.create({
    model: deployment,
    messages: [
      { role: "system", content: "You are a senior TypeScript code reviewer." },
      {
        role: "user",
        content: `Please review the following function and suggest improvements:\n\n\`\`\`ts\n${fn.code}\n\`\`\``
      }
    ],
    max_tokens: 400
  });*/

  const result = await client.chat.completions.create({
    messages: [
      { role:"system", content: "You are a senior TypeScript code reviewer." },
      { role:"user", content: `Please review the following function and suggest improvements:\n\n\`\`\`ts\n${fn.code}\n\`\`\`` }
    ],
    max_completion_tokens: 800,
    temperature: 1,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    model: modelName
  });

  return result.choices?.[0]?.message?.content ?? "";
}
