const apiBase = process.env.GITHUB_API_URL ?? "https://api.github.com";
const token = process.env.GITHUB_TOKEN;

if (!token) {
  console.error("GITHUB_TOKEN is required to verify pull request approval.");
  process.exit(1);
}

const repository = process.env.GITHUB_REPOSITORY;
const pullNumber = process.env.PULL_NUMBER;

if (!repository || !pullNumber) {
  console.error("GITHUB_REPOSITORY and PULL_NUMBER are required.");
  process.exit(1);
}

async function github(path) {
  const response = await fetch(`${apiBase}/repos/${repository}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API ${path} failed (${response.status}): ${body}`);
  }

  return response.json();
}

const pull = await github(`/pulls/${pullNumber}`);
const reviews = await github(`/pulls/${pullNumber}/reviews`);
const authorLogin = pull.user?.login;

const latestReviewByUser = new Map();

for (const review of reviews) {
  if (!review.user?.login || review.state === "PENDING") {
    continue;
  }

  latestReviewByUser.set(review.user.login, review.state);
}

const hasApproval = [...latestReviewByUser.entries()].some(
  ([login, state]) => login !== authorLogin && state === "APPROVED",
);

if (!hasApproval) {
  console.error(
    "Publishing requires an approving review from someone other than the pull request author.",
  );
  process.exit(1);
}

process.stdout.write("Pull request has a valid approving review.\n");
