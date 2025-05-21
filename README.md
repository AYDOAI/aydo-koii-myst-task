# AYDO Koii Myst Task

## Overview

**AYDO Koii Myst Task** is a decentralized Koii task that leverages the [Mysterium Network](https://www.mystnodes.com/) via a dedicated [AYDO Myst Pod](https://github.com/AYDOAI/aydo-koii-myst-pod). The task automates running, monitoring, and auditing Mysterium nodes, enabling participants to earn KOII and MYST tokens for providing reliable VPN infrastructure. The pod is launched and managed automatically by the task logic.

- **Pod repo:** [AYDOAI/aydo-koii-myst-pod](https://github.com/AYDOAI/aydo-koii-myst-pod)
- **Task repo:** [AYDOAI/aydo-koii-myst-task](https://github.com/AYDOAI/aydo-koii-myst-task)

## Architecture

- **Task logic** (`src/task/`): Orchestrates pod lifecycle, collects node state, submits proofs, audits, and distributes rewards.
- **Myst Pod**: Runs as a container, exposes REST API for health checks, state, registration, and audits.
- **Integration**: The task launches the pod using a custom podSpec (see `src/orcaSettings.ts`), interacts with it via `orcaClient.podCall()`.

## Quick Start

### Prerequisites

- Node.js >= 20.x (LTS)
- Yarn
- Docker & Docker Compose (for local pod testing)
- KOII wallet (for staking/rewards)

### Install

```sh
yarn install
```

### Build

```sh
yarn webpack
```

### Local Development

To run the task and pod locally (for debugging):

```sh
docker-compose up --build
```

- The pod will be available inside the container, exposing its REST API.
- The task will interact with the pod automatically.

### Environment Variables

Create a `.env` file (see `.env.developer.example` for template):

To test a [full round cycle](https://www.koii.network/docs/concepts/what-are-tasks/what-are-tasks/gradual-consensus), use the following command:

#### What is BENEFICIARY_WALLET?
Your earnings will automatically be paid out to the wallet address submitted below. If you have not set your wallet or would like to update it, please do it now. Please make sure the address is an **ERC-20 Polygon-compatible wallet**, e.g. MetaMask.

### Task Lifecycle

1. **Setup** (`src/task/0-setup.ts`): Prepares environment.
2. **Task Execution** (`src/task/1-task.ts`): Calls pod's `/task/:roundNumber` endpoint.
3. **Submission** (`src/task/2-submission.ts`): Fetches pod state, signs, and stores proof.
4. **Audit** (`src/task/3-audit.ts`): Verifies submissions via pod's `/audit` endpoint.
5. **Distribution** (`src/task/4-distribution.ts`): Calculates and distributes rewards.
6. **Custom Routes** (`src/task/5-routes.ts`): (Optional) Add custom HTTP endpoints.

## Reward Distribution

- In each round, all eligible participants share the reward equally.
- The reward token is **KOII**.
- Additionally, for running a Myst Node, you receive **MYST** token rewards to the same `BENEFICIARY_WALLET` (ERC-20 Polygon-compatible address).

## Myst Pod REST API

The pod exposes the following endpoints (see [pod repo](https://github.com/AYDOAI/aydo-koii-myst-pod)):

- `GET /` — Health check
- `POST /healthz` — Checks Myst process and node health
- `POST /task/:roundNumber` — Collects node state for a round
- `GET /submission/:roundNumber` — Returns submission for a round
- `POST /audit` — Audits a submission

The task interacts with these endpoints automatically; you do not need to call them manually.

## File Structure

- `src/orcaSettings.ts` — PodSpec and pod image config
- `src/task/0-setup.ts` — Setup logic
- `src/task/1-task.ts` — Main task logic (calls pod)
- `src/task/2-submission.ts` — Submission logic
- `src/task/3-audit.ts` — Audit logic
- `src/task/4-distribution.ts` — Reward distribution
- `src/task/5-routes.ts` — Custom HTTP routes (optional)
- `config-task.yml` — Task metadata/config for deployment
- `docker-compose.yaml` — Local dev/test orchestration

## Deployment

1. Edit `config-task.yml` (name, description, image, etc.)
2. Build: `yarn webpack`
3. Deploy using Koii CLI:
   ```sh
   npx @_koii/create-task-cli@latest
   ```
4. Add the generated Task ID to your node.

## Security

- Never commit secrets or private keys.
- Use `.gitignore` to exclude `.env` and sensitive files.

## Troubleshooting

- For pod issues, check pod logs (`docker-compose logs`).
- For task errors, check Koii node logs and `dist/` output.
- For help, open an issue or ask in [Koii Discord](https://discord.gg/koii-network).

---

**This README is up-to-date as of [2024-06]. For pod details, see [AYDO Myst Pod repo](https://github.com/AYDOAI/aydo-koii-myst-pod).**
**If you encounter any issues, don't hesitate to reach out by opening a ticket on [Discord](https://discord.gg/koii-network).**

---
