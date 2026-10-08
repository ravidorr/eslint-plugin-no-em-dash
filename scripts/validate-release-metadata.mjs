import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  readStablePackageVersion,
  validateSecurityPolicyVersion,
} from "./validate-security-policy-version.mjs";

export const RELEASE_LABEL_MINOR = "release:minor";
export const RELEASE_LABEL_MAJOR = "release:major";

const STABLE_TRIPLET = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

export function parseSemVerTriplet(version) {
  const match = STABLE_TRIPLET.exec(version);
  if (!match) {
    return null;
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

export function formatSemVerTriplet({ major, minor, patch }) {
  return `${major}.${minor}.${patch}`;
}

export function bumpSemVer(version, releaseType) {
  const parsed = parseSemVerTriplet(version);
  if (!parsed) {
    return null;
  }

  switch (releaseType) {
    case "patch":
      return formatSemVerTriplet({ ...parsed, patch: parsed.patch + 1 });
    case "minor":
      return formatSemVerTriplet({ major: parsed.major, minor: parsed.minor + 1, patch: 0 });
    case "major":
      return formatSemVerTriplet({ major: parsed.major + 1, minor: 0, patch: 0 });
    default:
      return null;
  }
}

export function releaseTypeFromLabels(labels) {
  const normalized = labels.map((label) => label.trim()).filter(Boolean);
  const hasMajor = normalized.includes(RELEASE_LABEL_MAJOR);
  const hasMinor = normalized.includes(RELEASE_LABEL_MINOR);

  if (hasMajor && hasMinor) {
    return {
      error: `Use only one release label: ${RELEASE_LABEL_MINOR} or ${RELEASE_LABEL_MAJOR}.`,
    };
  }

  if (hasMajor) {
    return { releaseType: "major" };
  }

  if (hasMinor) {
    return { releaseType: "minor" };
  }

  return { releaseType: "patch" };
}

export function readLockfilePackageVersion(lockfileContents) {
  try {
    const lockfile = JSON.parse(lockfileContents);
    const rootVersion = lockfile.version;
    const packageVersion = lockfile.packages?.[""]?.version;

    if (typeof rootVersion !== "string" || typeof packageVersion !== "string") {
      return null;
    }

    return rootVersion === packageVersion ? rootVersion : null;
  } catch {
    return null;
  }
}

export function validateChangelogForVersion(changelog, version) {
  const escaped = version.replaceAll(".", "\\.");
  const sectionPattern = new RegExp(
    `^## \\[${escaped}\\][^\n]*\\n(?<body>(?:[\\s\\S]*?))(?=^## \\[|\\z)`,
    "m",
  );
  const match = sectionPattern.exec(changelog);

  if (!match) {
    return {
      valid: false,
      error: `CHANGELOG.md is missing a section for version ${version}.`,
    };
  }

  const hasBullet = /^[ \t]*[-*][ \t]+.+$/m.test(match.groups.body);

  if (!hasBullet) {
    return {
      valid: false,
      error: `CHANGELOG.md section for ${version} must include at least one bullet entry.`,
    };
  }

  return { valid: true };
}

export function validateReleaseMetadata({
  basePackageJson,
  headPackageJson,
  headLockJson,
  headChangelog,
  headSecurityPolicy,
  labels = [],
}) {
  const baseVersion = readStablePackageVersion(basePackageJson);
  const headVersion = readStablePackageVersion(headPackageJson);

  if (!baseVersion) {
    return { valid: false, error: "Base package.json must contain a stable SemVer version." };
  }

  if (!headVersion) {
    return { valid: false, error: "package.json must contain a stable SemVer version." };
  }

  const labelResult = releaseTypeFromLabels(labels);
  if ("error" in labelResult) {
    return { valid: false, error: labelResult.error };
  }

  const expectedVersion = bumpSemVer(baseVersion, labelResult.releaseType);

  if (!expectedVersion) {
    return { valid: false, error: "Unable to compute the expected release version." };
  }

  if (headVersion !== expectedVersion) {
    return {
      valid: false,
      error: `Expected version ${expectedVersion} for a ${labelResult.releaseType} release from ${baseVersion}, but package.json declares ${headVersion}.`,
    };
  }

  const lockVersion = readLockfilePackageVersion(headLockJson);

  if (lockVersion !== headVersion) {
    return {
      valid: false,
      error: "package-lock.json must declare the same version as package.json.",
    };
  }

  const changelogResult = validateChangelogForVersion(headChangelog, headVersion);
  if (!changelogResult.valid) {
    return changelogResult;
  }

  const policyResult = validateSecurityPolicyVersion(headPackageJson, headSecurityPolicy);
  if (!policyResult.valid) {
    return policyResult;
  }

  return { valid: true, version: headVersion, releaseType: labelResult.releaseType };
}

function readGitFile(ref, path) {
  return execFileSync("git", ["show", `${ref}:${path}`], { encoding: "utf8" });
}

function parseLabelsArgument(rawLabels) {
  if (!rawLabels) {
    return [];
  }

  return rawLabels
    .split(",")
    .map((label) => label.trim())
    .filter(Boolean);
}

export function validateReleaseMetadataFromGit({ baseRef, labels = [] }) {
  try {
    return validateReleaseMetadata({
      basePackageJson: readGitFile(baseRef, "package.json"),
      headPackageJson: readFileSync("package.json", "utf8"),
      headLockJson: readFileSync("package-lock.json", "utf8"),
      headChangelog: readFileSync("CHANGELOG.md", "utf8"),
      headSecurityPolicy: readFileSync("SECURITY.md", "utf8"),
      labels,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { valid: false, error: `Unable to read release metadata files: ${message}` };
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  let baseRef = "origin/main";
  let labels = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--base-ref") {
      baseRef = args[index + 1] ?? baseRef;
      index += 1;
      continue;
    }

    if (arg === "--labels") {
      labels = parseLabelsArgument(args[index + 1] ?? "");
      index += 1;
    }
  }

  const result = validateReleaseMetadataFromGit({ baseRef, labels });

  if (!result.valid) {
    console.error(result.error);
    process.exit(1);
  }

  process.stdout.write(
    `Release metadata is valid for ${result.version} (${result.releaseType}).\n`,
  );
}
