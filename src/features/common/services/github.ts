export async function fetchChangelog(
  owner: string,
  repo: string,
  path: string,
  branch = "main"
): Promise<string> {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;

  const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour

  if (!response.ok) {
    throw new Error(
      `Failed to fetch changelog: ${response.status} ${response.statusText}`
    );
  }

  return response.text();
}
