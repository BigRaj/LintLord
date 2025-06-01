import { InvocationContext } from "@azure/functions";
import fetch from "node-fetch";

export async function postPRComment(context: InvocationContext,{
  token,
  owner,
  repo,
  pullNumber,
  body,
  path,
  line,
  commitId
}: {
  token: string;
  owner: string;
  repo: string;
  pullNumber: number;
  body: string;
  path: string;
  line: number;
  commitId: string;
}) {
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/comments`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json"
    },
    body: JSON.stringify({
      body,
      commit_id: commitId,
      path,
      line,
      side: "RIGHT"
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    context.error("❌ GitHub comment failed", {
        status: res.status,
        message: err.message,
        error: err
    });
    throw new Error("GitHub comment failed");
    }

  return await res.json();
}
