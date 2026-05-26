import { z } from "npm:zod@4.3.6";

/** Global arguments shared by every Azure model in this package. */
export const AzureGlobalArgsSchema = z.object({
  subscriptionId: z.string().describe(
    "Azure subscription ID. Use: ${{ vault.get('azure', 'SUBSCRIPTION_ID') }}",
  ),
  resourceGroup: z
    .string()
    .optional()
    .describe("Default resource group for operations that require one"),
});

/**
 * Invoke the `az` CLI with the given arguments and return parsed JSON output.
 *
 * @param args - Arguments to pass to `az` (without `--output json`).
 * @param subscriptionId - Optional Azure subscription ID scoping the call.
 * @returns The parsed JSON result, or `null` for commands with empty stdout.
 * @throws When `az` exits with a non-zero status code.
 */
export async function az(
  args: string[],
  subscriptionId?: string,
): Promise<unknown> {
  const fullArgs = [...args, "--output", "json"];
  if (subscriptionId) {
    fullArgs.push("--subscription", subscriptionId);
  }

  const cmd = new Deno.Command("az", {
    args: fullArgs,
    stdout: "piped",
    stderr: "piped",
  });

  const result = await cmd.output();
  const stderr = new TextDecoder().decode(result.stderr);

  if (result.code !== 0) {
    throw new Error(`az ${args.slice(0, 3).join(" ")} failed: ${stderr}`);
  }

  const stdout = new TextDecoder().decode(result.stdout).trim();
  if (!stdout) return null;

  return JSON.parse(stdout);
}

/**
 * Sanitize an Azure resource name for use as a swamp data instance name.
 * Lowercases, replaces `..` with `--`, slashes with `-`, and strips NULs.
 */
export function sanitizeInstanceName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\.\./g, "--")
    .replace(/[/\\]/g, "-")
    .replace(/\0/g, "");
}

/**
 * Return the resource group from a method argument or fall back to the global
 * argument. Throws if neither is provided.
 */
export function requireResourceGroup(
  methodArg: string | undefined,
  globalArg: string | undefined,
): string {
  const rg = methodArg || globalArg;
  if (!rg) {
    throw new Error(
      "resourceGroup is required — pass it as an argument or set it in globalArguments",
    );
  }
  return rg;
}
