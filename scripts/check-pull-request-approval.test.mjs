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

test("accepts a pull request opened by the repository owner without a review", () => {
  assert.equal(
    hasValidApproval({
      reviews: [],
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

test("rejects a non-approving review from the repository owner", () => {
  assert.equal(
    hasValidApproval({
      reviews: [reviewer("owner", "COMMENTED")],
      authorLogin: "contributor",
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
