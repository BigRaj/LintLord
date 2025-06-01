import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { loadGitHubPem } from "../../utils/loadGitHubSecrets";

export async function KeyVaultTest(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const privateKey = await loadGitHubPem();
    context.log("✅ Loaded .pem key (truncated):", privateKey.slice(0, 60) + "...");
    return {
      status: 200,
      body: "Key vault read test complete.",
    };
  } catch (err) {
    context.error("❌ Failed to load .pem key:", err);
    return {
      status: 500,
      body: "Failed to read Key Vault secret.",
    };
  }
}

app.http("KeyVaultTest", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: KeyVaultTest,
});
