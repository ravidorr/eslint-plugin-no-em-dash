import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  RELEASE_LABEL_MAJOR,
  RELEASE_LABEL_MINOR,
  bumpSemVer,
  readLockfilePackageVersion,
  releaseTypeFromLabels,
  validateChangelogForVersion,
  validateReleaseMetadata,
} from "./validate-release-metadata.mjs";

const basePackageJson = '{"version":"1.0.1"}';
const supportedStatus = String.fromCodePoint(0x2713);

const policyFor = (version) => `## Supported Versions

| Version | Supported |
| ------- | --------- |
| ${version} | ${supportedStatus} |
| Earlier releases | ✘ |
`;

const lockFor = (version) =>
  JSON.stringify({
    name: "eslint-plugin-no-em-dash",
    version,
    lockfileVersion: 3,
    packages: {
      "": {
        name: "eslint-plugin-no-em-dash",
        version,
      },
    },
  });

const changelogFor = (version, bullet = "- Example change") => `# Changelog

## [${version}] - 2026-10-08

${bullet}

## [1.0.0] - 2026-01-09
`;

test("releaseTypeFromLabels defaults to patch", () => {
  assert.deepEqual(releaseTypeFromLabels([]), { releaseType: "patch" });
});

test("releaseTypeFromLabels respects minor and major labels", () => {
  assert.deepEqual(releaseTypeFromLabels([RELEASE_LABEL_MINOR]), { releaseType: "minor" });
  assert.deepEqual(releaseTypeFromLabels([RELEASE_LABEL_MAJOR]), { releaseType: "major" });
});

test("releaseTypeFromLabels rejects conflicting labels", () => {
  assert.match(
    releaseTypeFromLabels([RELEASE_LABEL_MINOR, RELEASE_LABEL_MAJOR]).error,
    /only one release label/i,
  );
});

test("bumpSemVer patch from 1.0.1 to 1.0.2", () => {
  assert.equal(bumpSemVer("1.0.1", "patch"), "1.0.2");
});

test("bumpSemVer minor from 1.0.1 to 1.1.0", () => {
  assert.equal(bumpSemVer("1.0.1", "minor"), "1.1.0");
});

test("bumpSemVer major from 1.0.1 to 2.0.0", () => {
  assert.equal(bumpSemVer("1.0.1", "major"), "2.0.0");
});

test("validateReleaseMetadata accepts a valid patch release", () => {
  assert.deepEqual(
    validateReleaseMetadata({
      basePackageJson,
      headPackageJson: '{"version":"1.0.2"}',
      headLockJson: lockFor("1.0.2"),
      headChangelog: changelogFor("1.0.2"),
      headSecurityPolicy: policyFor("1.0.2"),
      labels: [],
    }),
    { valid: true, version: "1.0.2", releaseType: "patch" },
  );
});

test("validateReleaseMetadata accepts minor and major label releases", () => {
  assert.deepEqual(
    validateReleaseMetadata({
      basePackageJson,
      headPackageJson: '{"version":"1.1.0"}',
      headLockJson: lockFor("1.1.0"),
      headChangelog: changelogFor("1.1.0"),
      headSecurityPolicy: policyFor("1.1.0"),
      labels: [RELEASE_LABEL_MINOR],
    }),
    { valid: true, version: "1.1.0", releaseType: "minor" },
  );

  assert.deepEqual(
    validateReleaseMetadata({
      basePackageJson,
      headPackageJson: '{"version":"2.0.0"}',
      headLockJson: lockFor("2.0.0"),
      headChangelog: changelogFor("2.0.0"),
      headSecurityPolicy: policyFor("2.0.0"),
      labels: [RELEASE_LABEL_MAJOR],
    }),
    { valid: true, version: "2.0.0", releaseType: "major" },
  );
});

test("validateReleaseMetadata rejects incorrect version bumps", () => {
  const result = validateReleaseMetadata({
    basePackageJson,
    headPackageJson: '{"version":"1.1.0"}',
    headLockJson: lockFor("1.1.0"),
    headChangelog: changelogFor("1.1.0"),
    headSecurityPolicy: policyFor("1.1.0"),
    labels: [],
  });

  assert.equal(result.valid, false);
  assert.match(result.error, /Expected version 1\.0\.2/);
});

test("validateReleaseMetadata rejects mismatched lockfiles and changelog entries", () => {
  const lockMismatch = validateReleaseMetadata({
    basePackageJson,
    headPackageJson: '{"version":"1.0.2"}',
    headLockJson: lockFor("1.0.1"),
    headChangelog: changelogFor("1.0.2"),
    headSecurityPolicy: policyFor("1.0.2"),
    labels: [],
  });
  assert.match(lockMismatch.error, /package-lock\.json/);

  const changelogMismatch = validateReleaseMetadata({
    basePackageJson,
    headPackageJson: '{"version":"1.0.2"}',
    headLockJson: lockFor("1.0.2"),
    headChangelog: changelogFor("9.9.9"),
    headSecurityPolicy: policyFor("1.0.2"),
    labels: [],
  });
  assert.match(changelogMismatch.error, /CHANGELOG\.md is missing a section for version 1\.0\.2/);
});

test("validateChangelogForVersion rejects empty sections", () => {
  const result = validateChangelogForVersion(changelogFor("1.0.2", ""), "1.0.2");
  assert.match(result.error, /at least one bullet entry/);
});

test("validateReleaseMetadata rejects stale SECURITY.md versions", () => {
  const result = validateReleaseMetadata({
    basePackageJson,
    headPackageJson: '{"version":"1.0.2"}',
    headLockJson: lockFor("1.0.2"),
    headChangelog: changelogFor("1.0.2"),
    headSecurityPolicy: policyFor("1.0.1"),
    labels: [],
  });

  assert.equal(result.valid, false);
  assert.match(result.error, /SECURITY\.md supports 1\.0\.1/);
});

test("publish workflow supports npm trusted publishing", () => {
  const publishWorkflow = readFileSync(".github/workflows/publish.yml", "utf8");
  const releaseWorkflow = readFileSync(".github/workflows/release-metadata.yml", "utf8");

  assert.match(publishWorkflow, /id-token: write/);
  assert.match(publishWorkflow, /registry-url: https:\/\/registry\.npmjs\.org/);
  assert.match(publishWorkflow, /npm publish --provenance/);
  assert.match(publishWorkflow, /check-pull-request-approval\.mjs/);
  assert.match(releaseWorkflow, /name: Validate release metadata/);
});

test("readLockfilePackageVersion requires root and package versions to match", () => {
  assert.equal(readLockfilePackageVersion(lockFor("1.0.2")), "1.0.2");
  assert.equal(
    readLockfilePackageVersion(
      JSON.stringify({
        version: "1.0.2",
        packages: { "": { version: "1.0.1" } },
      }),
    ),
    null,
  );
});
