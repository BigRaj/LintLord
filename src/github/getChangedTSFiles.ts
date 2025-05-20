type ChangedTSFile = {
  filename: string;
  content: string;
};

export async function getChangedTSFiles(
  token: string,
  owner: string,
  repo: string,
  pull_number: number
): Promise<ChangedTSFile[]> {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json"
  };

  // 1. Get changed files in the PR
  const filesRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}/files`,
    { headers }
  );

  if (!filesRes.ok) throw new Error(`Failed to fetch PR files: ${filesRes.statusText}`);

  const files = await filesRes.json();

const extensions = [".ts", ".tsx"];
const tsFiles = files.filter(
  (f: any) =>
    f.status !== "removed" && extensions.some(ext => f.filename.endsWith(ext))
);

  // 2. Get PR details to extract the commit SHA
  const prRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}`,
    { headers }
  );
  const pr = await prRes.json();
  const sha = pr.head.sha;

  // 3. Fetch raw content of each .ts file at the PR's commit
  const results: ChangedTSFile[] = [];

  for (const path of tsFiles) {
    const rawRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${sha}`,
      { headers }
    );
    if (!rawRes.ok) continue;

    const file = await rawRes.json();
    const content = Buffer.from(file.content, "base64").toString("utf8");

    results.push({ filename: path, content });
  }

  return results;
}
