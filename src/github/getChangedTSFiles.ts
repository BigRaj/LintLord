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
  const prFilesUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}/files`;

  const filesRes = await fetch(prFilesUrl, { headers });
  if (!filesRes.ok) {
    throw new Error(`❌ Failed to fetch PR files: ${filesRes.status} ${filesRes.statusText}`);
  }

  const files = await filesRes.json();

  const extensions = [".ts", ".tsx"];
  const tsFiles = files.filter(
    (f: any) =>
      f.status !== "removed" &&
      extensions.some(ext => f.filename.endsWith(ext)) &&
      f.raw_url
  );

  const results: ChangedTSFile[] = [];

  for (const file of tsFiles) {
    try {
      const res = await fetch(file.raw_url, { headers });
      if (!res.ok) {
        console.warn(`⚠️ Failed to fetch raw file: ${file.filename} - ${res.status}`);
        continue;
      }

      const content = await res.text();
      results.push({ filename: file.filename, content });
    } catch (err) {
      console.warn(`⚠️ Error fetching file ${file.filename}:`, err);
    }
  }

  return results;
}
