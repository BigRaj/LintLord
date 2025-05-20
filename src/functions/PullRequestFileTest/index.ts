import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getInstallationAccessToken } from "../../auth/githubInstallToken";
import { loadGitHubSecrets } from "../../auth/loadGitHubSecrets";
import { getChangedTSFiles } from "../../github/getChangedTSFiles";

export async function PullRequestFileTest(
  req: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const prNumber = parseInt(req.query.get("pr") || "0");
    if (!prNumber) {
      return { status: 400, body: "Missing ?pr=123 parameter" };
    }

    const { appId, installationId } = await loadGitHubSecrets();
    const token = await getInstallationAccessToken(appId, installationId);

    const files = await getChangedTSFiles(token, "BigRaj", "LintLord", prNumber);

    context.log(`✅ Retrieved ${files.length} .ts files from PR #${prNumber}`);

    return {
      status: 200,
      body: JSON.stringify(files.map(f => ({ filename: f.filename, length: f.content.length })))
    };
  } catch (err) {
    context.error("❌ Failed to fetch PR files:", err);
    return {
      status: 500,
      body: "Error retrieving PR files"
    };
  }
}

app.http("PullRequestFileTest", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: PullRequestFileTest
});
