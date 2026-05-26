# @rkcoleman/azure-containers

Swamp extension package providing lifecycle models for **Azure Container Apps**, **Container Apps managed environments**, and **Azure Container Registry**. Wraps the `az` CLI under the hood and is designed to compose with `@dougschaefer/azure-*` for full Azure resource-group inventory and automation.

## Models

| Type | Methods |
|---|---|
| `@rkcoleman/azure-container-app` | `list`, `get`, `sync`, `create`, `update`, `delete`, `listRevisions`, `getRevision`, `activateRevision`, `deactivateRevision`, `restartRevision` |
| `@rkcoleman/azure-container-app-environment` | `list`, `get`, `sync`, `create`, `update`, `delete`, `listCertificates`, `uploadCertificate` |
| `@rkcoleman/azure-container-registry` | `list`, `get`, `sync`, `create`, `update`, `delete`, `listRepositories`, `listTags`, `getCredentials` |

## Prerequisites

- The `az` CLI is installed and authenticated (`az login`).
- The `containerapp` extension is installed (`az extension add --name containerapp`) — required for any Container Apps method.
- A vault holding your Azure subscription ID. The recommended setup:
  ```bash
  swamp vault create local_encryption azure
  swamp vault put azure SUBSCRIPTION_ID <your-subscription-id>
  ```

## Quick start

Pull and create a model:

```bash
swamp extension pull @rkcoleman/azure-containers

swamp model create @rkcoleman/azure-container-app my-apps \
  --global-arg 'subscriptionId=${{ vault.get("azure", "SUBSCRIPTION_ID") }}' \
  --global-arg 'resourceGroup=my-rg'

swamp model method run my-apps list
```

## Global arguments

All three models share the same global argument schema:

| Argument | Required | Description |
|---|---|---|
| `subscriptionId` | yes | Azure subscription ID. Pass via vault expression. |
| `resourceGroup` | no | Default resource group used when a method-level `resourceGroup` is not supplied. |

## Composing with other models

Outputs are addressable by CEL — wire models together rather than re-fetching:

```cel
data.latest("my-registries", "logancontainers").attributes.loginServer
```

## Method scope

These models cover the resource lifecycle and common state transitions. They intentionally do not wrap every `az` subcommand — data-plane operations (image push/pull, interactive exec, opinionated `containerapp up`) are out of scope. Extend with `export const extension` if you need additional methods.

## Companion extensions

- [`@dougschaefer/azure`](https://swamp-club.com) — VMs, VNets, NSGs, Storage, Key Vault, SQL, DNS, and 17 more Azure resource types.

## License

MIT
