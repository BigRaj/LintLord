import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getInstallationAccessToken } from "../../auth/githubInstallToken";
import { loadGitHubSecrets } from "../../utils/loadGitHubSecrets";
import { getChangedTSFiles } from "../../github/getChangedTSFiles";
import { extractFunctionsFromTS } from "../../utils/extractFunctions";
import { filterReviewableFunctions } from "../../utils/filterFunctions";
import { runOpenAIReview } from "../../openai/runOpenAIReview";
import { postPRComment } from "../../github/postPRComment";
import { loadAISecrets } from "../../utils/loadAISecrets";
import { getSafeCommentLine } from "../../github/getSafeCommentLine";


export async function PullRequestFileTest(
  req: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const modelVersion = "41"
  const { endpoint, deployment, apiVersion } = await loadAISecrets(modelVersion);
  
    context.log("📤 Calling Azure OpenAI", {
      endpoint,
      deployment,
      apiVersion
    });
    context.log("Expected full request URL:");
context.log(`${endpoint}openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`);
  try {
    const prNumber = parseInt(req.query.get("pr") || "0");
    if (!prNumber) {
      return { status: 400, body: "Missing ?pr=123 parameter" };
    }

    const { appId, installationId } = await loadGitHubSecrets();
    const token = await getInstallationAccessToken(appId, installationId);

    const files = await getChangedTSFiles(token, "BigRaj", "LintLord", prNumber);

    // extract + filter
    const allFunctions = files.flatMap(file => {
      const rawFunctions = extractFunctionsFromTS(file.filename, file.content);
      const reviewable = filterReviewableFunctions(rawFunctions);

      context.log(`📌 ${file.filename}: ${reviewable.length} functions will be reviewed.`);
      return reviewable;
    });

    context.log(`🧠 Found ${allFunctions.length} functions in PR #${prNumber}`);

    // review each function via OpenAI
    const prRes = await fetch(`https://api.github.com/repos/BigRaj/LintLord/pulls/${prNumber}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json"
      }
    });

    if (!prRes.ok) throw new Error("Failed to fetch PR details");

    const pr = await prRes.json();
    const commitId = pr.head.sha;
    context.log(`Commit Id: ${commitId}`)
    const reviews = await Promise.all(
      allFunctions.map(async fn => {
        const reviewText = await runOpenAIReview(fn);
        context.log(`🔍 Review for ${fn.filename} -> ${fn.name}:\n${reviewText}`);

        // ⬇️ Add this to post the comment
        const safeLine = await getSafeCommentLine(token, "BigRaj", "LintLord", prNumber, fn.filename);
        if (!safeLine) {
          context.log(`⚠️ No valid line found in diff for ${fn.filename}`);
          return;
        }

        await postPRComment(context,{
          token,
          owner: "BigRaj",
          repo: "LintLord",
          pullNumber: prNumber,
          body: reviewText,
          path: fn.filename,
          line: safeLine,
          commitId
        });

        return {
          filename: fn.filename,
          function: fn.name,
          line: safeLine,
          review: reviewText
        };
      })
    );

    return {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviews, null, 2)
    };
  } catch (err) {
    context.error("❌ Failed to review PR:", err);
    return {
      status: 500,
      body: "Error during OpenAI review"
    };
  }
}

app.http("PullRequestFileTest", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: PullRequestFileTest
});
