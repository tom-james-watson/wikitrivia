import { execFileSync } from "child_process";
import { existsSync } from "fs";
import path from "path";

const CONTACT_EMAIL_ENV = "WIKITRIVIA_CONTACT_EMAIL";

function requireEnvFile() {
  if (!existsSync(path.join(process.cwd(), ".env"))) {
    throw new Error(
      "Wikimedia API scripts require a .env file. Copy .env.example to .env and fill in WIKITRIVIA_CONTACT_EMAIL.",
    );
  }
}

function requireEnvValue(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  if (value.includes("your-email") || value.includes("example.com")) {
    throw new Error(`Replace the placeholder value for ${name} in .env`);
  }

  return value;
}

function parseGitHubRepoSlug(remoteUrl: string): string | null {
  const trimmedUrl = remoteUrl.trim();

  const sshMatch = trimmedUrl.match(
    /^(?:ssh:\/\/)?git@github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?$/u,
  );
  if (sshMatch) {
    return sshMatch[1];
  }

  const httpsMatch = trimmedUrl.match(
    /^https:\/\/github\.com\/([^/]+\/[^/]+?)(?:\.git)?$/u,
  );
  return httpsMatch?.[1] ?? null;
}

function getGitHubRepoSlug(): string {
  const remoteUrl = execFileSync("git", ["remote", "get-url", "origin"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  const repoSlug = parseGitHubRepoSlug(remoteUrl);
  if (!repoSlug) {
    throw new Error(
      `Could not derive GitHub repo name from origin remote: ${remoteUrl.trim()}`,
    );
  }

  return repoSlug;
}

export function getWikimediaUserAgent(): string {
  requireEnvFile();

  const contactEmail = requireEnvValue(CONTACT_EMAIL_ENV);
  if (!contactEmail.includes("@")) {
    throw new Error(`${CONTACT_EMAIL_ENV} must be an email address`);
  }

  const repoSlug = getGitHubRepoSlug();
  return `${repoSlug} (${contactEmail}; https://github.com/${repoSlug})`;
}
