import { generateGitHubAppJWT } from "./githubAppAuth";

export async function getInstallationAccessToken(appId: string, installationId: number): Promise<string> {
  const { Octokit } = await import("@octokit/rest");

  const jwt = await generateGitHubAppJWT(appId);

  const octokit = new Octokit({ auth: jwt });
  const res = await octokit.request(
    "POST /app/installations/{installation_id}/access_tokens",
    {
      installation_id: installationId,
      headers: {
        accept: "application/vnd.github+json",
      },
    }
  );

  return res.data.token;
}
