export async function getSafeCommentLine(
  token: string,
  owner: string,
  repo: string,
  prNumber: number,
  filename: string
): Promise<number | null> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json"
    }
  });

  if (!res.ok) return null;
  const files = await res.json();

  const file = files.find((f: any) => f.filename === filename);
  if (!file || !file.patch) return null;

  const patchLines = file.patch.split("\n");
  const hunk = patchLines.find(l => l.startsWith("@@"));
  const match = hunk?.match(/\+(\d+)/); // e.g. @@ -10,7 +12,8 @@

  if (!match) return null;

  const startingLine = parseInt(match[1], 10);

  // Find first added line (excluding metadata lines)
  for (let i = 0; i < patchLines.length; i++) {
    const line = patchLines[i];
    if (line.startsWith("+") && !line.startsWith("++")) {
      // Return startingLine + relative index of this line
      const addedOffset = patchLines.slice(0, i).filter(l => l.startsWith("+") && !l.startsWith("++")).length;
      return startingLine + addedOffset - 1;
    }
  }

  return startingLine; // fallback to top of hunk
}
