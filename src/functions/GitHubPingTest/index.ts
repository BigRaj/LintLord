import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getInstallationAccessToken } from "../../auth/githubInstallToken";
import { loadGitHubSecrets } from "../../auth/loadGitHubSecrets";

export async function GitHubPingTest(
  req: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const { appId, installationId } = await loadGitHubSecrets();
    const token = await getInstallationAccessToken(appId, installationId);

    return {
      status: 200,
      body: `✅ GitHub token: ${token.slice(0, 20)}...`,
    };
  } catch (err) {
    context.error("❌ Failed to get GitHub token:", err);
    return {
      status: 500,
      body: "Error generating GitHub token"
    };
  }
}

app.http("GitHubPingTest", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: GitHubPingTest
});
