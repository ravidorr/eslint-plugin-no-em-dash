import assert from "node:assert/strict";
import test from "node:test";

import { hasValidApproval } from "./check-pull-request-approval.mjs";

const reviewer = (login, state) => ({ state, user: { login } });

test("accepts an approving review from a non-author", () => {
  assert.equal(
    hasValidApproval({
      reviews: [reviewer("maintainer", "APPROVED")],
      authorLogin: "contributor",
      repositoryOwnerLogin: "owner",
    }),
    true,
  );
});

test("accepts an approving review from the repository owner on their own pull request", () => {
  assert.equal(
    hasValidApproval({
      reviews: [reviewer("owner", "APPROVED")],
      authorLogin: "owner",
      repositoryOwnerLogin: "owner",
    }),
    true,
  );
});

test("rejects an approving review from a non-owner author", () => {
  assert.equal(
    hasValidApproval({
      reviews: [reviewer("contributor", "APPROVED")],
      authorLogin: "contributor",
      repositoryOwnerLogin: "owner",
    }),
    false,
  );
});

test("rejects a repository owner's non-approving review", () => {
  assert.equal(
    hasValidApproval({
      reviews: [reviewer("owner", "COMMENTED")],
      authorLogin: "owner",
      repositoryOwnerLogin: "owner",
    }),
    false,
  );
});

test("uses each reviewer's latest submitted review", () => {
  assert.equal(
    hasValidApproval({
      reviews: [
        reviewer("maintainer", "APPROVED"),
        reviewer("maintainer", "CHANGES_REQUESTED"),
      ],
      authorLogin: "contributor",
      repositoryOwnerLogin: "owner",
    }),
    false,
  );
});
