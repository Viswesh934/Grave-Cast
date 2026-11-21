# Deploy plan: Vercel (website) + AWS Lambda (API)

Status: plan only. Nothing here has been built or run yet. Pick up from "Order of work" at the bottom.

The API deploys with a GitHub Actions workflow: OIDC role, a Docker image in ECR, and `aws lambda update-function-code`. That replaces the earlier SAM plan, so vision doc §9 needs a row for it before building (working agreement rule 3). The Fuel Check project is abandoned and nothing here depends on it.

- AWS account: `136172187126`. Region: `ap-south-1` (Mumbai).
- Existing OIDC role: `arn:aws:iam::136172187126:role/OIDC`.

## 0. Decide first

1. **Decided: container image in ECR.** Lambda runs the Python API through the Web Adapter in a container (section 4, item 1).
   - Cost: ECR private storage is $0.10 per GB-month. New accounts get 500 MB free for their first year only (aws.amazon.com/ecr/pricing).
   - With a 100–200 MB image and a lifecycle rule that keeps the last 2 images, that is about $0.02–0.04 a month.
   - We accept this small cost. The vision doc's "zero cost" goal becomes "near zero": update its §7 and §9 when building.
2. **Decided: reuse the existing `OIDC` role as Gravecast's deploy role.** Nothing else uses it. Edit its trust policy and add the Gravecast permissions (section 1, steps 2 and 3). Replace any old Fuel Check repo in the `sub` condition rather than adding to it.
3. **Decided: DynamoDB on-demand.** The account is on the Paid plan and per-request billing is accepted, so there is no 25/25 free-capacity limit to fit inside, and a busy room never throttles. The $1 billing alert, rate limits and reserved concurrency stay as the guardrails. Vision doc §9 has the row.

## 1. AWS console (manual, once)

1. **Billing alert at $1.** The vision doc requires it: the account is on the Paid plan, so usage beyond the free tier is billed, not paused.
2. **OIDC trust.** In the `OIDC` role's trust policy, set the `token.actions.githubusercontent.com:sub` condition to `repo:Viswesh934/Grave-Cast:ref:refs/heads/main`. Keep `aud` as `sts.amazonaws.com`. The GitHub OIDC provider already exists in the account.
3. **Deploy permissions on that role, scoped to Gravecast:**
   - `ecr:GetAuthorizationToken`
   - on the `gravecast-api` repository: `ecr:BatchCheckLayerAvailability`, `ecr:InitiateLayerUpload`, `ecr:UploadLayerPart`, `ecr:CompleteLayerUpload`, `ecr:PutImage`, `ecr:BatchGetImage`, `ecr:GetDownloadUrlForLayer`
   - Lambda's docs also list `ecr:GetRepositoryPolicy` and `ecr:SetRepositoryPolicy` for whoever creates the function from an image. If the ECR repository has no policy letting Lambda read images, Lambda tries to add one, and can only do so with those two. Either give them to whoever creates the function (you, in the console) or add the repository policy yourself in step 4 (`lambda.amazonaws.com` allowed `ecr:BatchGetImage` and `ecr:GetDownloadUrlForLayer`).
   - on the `gravecast-api` function: `lambda:GetFunction`, `lambda:GetFunctionConfiguration`, `lambda:UpdateFunctionCode`
4. **ECR repository** `gravecast-api`, private, with the lifecycle rule "keep last 2 images". The workflow does not create the repository (so it never needs `ecr:CreateRepository`), and it fails if the repository is missing. Make the rule apply to images of any tag status: pushing the same tag again leaves the old image untagged, and a rule limited to tagged images would never delete it.
5. **DynamoDB table** for Chat (the store is written; this is the console part):
   - Table name `gravecast-channel`. Partition key `pk` (String), sort key `sk` (String).
   - Capacity mode: on-demand. Table class: Standard.
   - After it is created, turn on time to live (Additional settings, Time to Live) with the attribute name `expires_at`. It clears the msgid markers after 30 days. Without it everything still works; the markers just stay.
6. **Lambda execution role:** reuse the old role from the abandoned Fuel Check function, picked as "Use an existing role" when creating the function. It needs the `lambda.amazonaws.com` trust and `AWSLambdaBasicExecutionRole` (logs). Add an inline policy for Gravecast's table, with `dynamodb:GetItem`, `dynamodb:Query`, `dynamodb:PutItem`, `dynamodb:UpdateItem` and `dynamodb:DeleteItem` on `arn:aws:dynamodb:ap-south-1:136172187126:table/gravecast-channel` only. (A transaction needs the Put, Update and Delete permissions; there is no separate transaction permission.) Check the role's other permissions first: anything left over from Fuel Check (DynamoDB on `*`, other tables, S3) is also available to this function, so remove what isn't needed.
7. **Lambda function** `gravecast-api`:
   - Create it from the container image after the first image is pushed. The workflow only updates an existing function; on the first run it pushes the image and warns.
   - Memory 512 MB.
   - Timeout 60 s: a link scan is capped at 15 s, but a repo scan downloads and reads a zipball.
   - Ephemeral storage: the default 512 MB is enough. Repo size is capped at 100 MB (`GRAVECAST_MAX_REPO_SIZE_KB`) and at most 25 MB is read (`GRAVECAST_MAX_TOTAL_BYTES`).
   - **Reserved concurrency** of about 5, which the vision doc requires. Lambda always keeps 100 units unreserved, so you can reserve at most the account limit minus 100. The documented default limit is 1,000, but a new account may have as little as 10, which leaves nothing to reserve. Run `aws lambda get-account-settings` first, and request an increase if `UnreservedConcurrentExecutions` is below 5.
   - Environment variables:
     - `GRAVECAST_WORKSPACE_ROOT=/tmp/repositories`. Lambda can only write under `/tmp`.
     - `GRAVECAST_CHANNEL_STORE=dynamodb` and `GRAVECAST_CHANNEL_TABLE=gravecast-channel`. Set them only once the table and the role's policy exist: the API starts on SQLite in `/tmp` until then. The region comes from Lambda's own `AWS_REGION`.
     - `GITHUB_TOKEN`, optional; read-only public access is enough
     - `GRAVECAST_ORIGIN_SECRET`: a long random value (for example `openssl rand -hex 32`), the same as Vercel's `ORIGIN_SECRET` (section 3). The API refuses `/api` requests that don't carry it (section 4, item 7).
8. **Function URL:**
   - auth type `NONE`, invoke mode `BUFFERED`
   - The function needs a resource-based policy allowing `lambda:InvokeFunctionUrl` and `lambda:InvokeFunction` for everyone. The console adds it when it creates the URL. If you use the CLI, CloudFormation or the API, add both statements yourself with `aws lambda add-permission`, or every request gets 403 Forbidden. Add `lambda:InvokedViaFunctionUrl` to the second statement, as AWS recommends.
   - Leave the URL's own CORS setting off. The site calls the API on its own address and Vercel forwards the request (section 3, step 4), so the browser never makes a cross-origin call and CORS is not needed. CORS was never access control anyway: it only tells browsers what a page may read, and curl or a script ignores it. Locking the API to our site is done with the origin secret instead.
9. **CloudWatch log retention: skipped by choice.** Lambda still writes its logs to `/aws/lambda/gravecast-api` while the execution role allows it, and they are kept forever. The volume is small. To stop logging entirely, remove the log permissions from the role, but then a failed start leaves no message.

## 2. GitHub (manual)

1. Repository secrets:
   - `AWS_ROLE_ARN`
   - `ECR_REPOSITORY=gravecast-api`
   - `LAMBDA_FUNCTION_NAME=gravecast-api`
   - `LAMBDA_FUNCTION_URL` (once the URL exists)
2. Merge `feat/haunted-graveyard-6` into `main`. The workflow runs on pushes to `main`.

## 3. Vercel (manual)

1. Import the repo.
   - Root directory: `apps/gravecast`. Turn on "Include files outside the root directory": the app imports `packages/grave-ui`.
   - Framework: Vite. Build: `npm run build`. Output: `dist`.
   - `vercel.json` sets the install and build commands: Groove UI is installed and built first (`npm ci --prefix ../../packages/grave-ui`, then `npm run build --prefix ...`), because its `dist` folder is not in git and the app imports `groove-ui/grimoire` from it. The first Vercel build is the test that this order works; no GitHub job checks the website.
2. Environment variables:
   - Leave `VITE_API_URL` unset. The app then calls `/api/...` on its own address, as it does in development, and the rewrite in step 4 forwards it.
   - `ORIGIN_SECRET` = the same value as the Lambda's `GRAVECAST_ORIGIN_SECRET`. Not a `VITE_` value: those are built into the page and public. This one is only read by Vercel when it forwards a request.
   - `VITE_AWS_LOCATION_KEY`
   - `VITE_AWS_LOCATION_REGION`
3. Amazon Location key: allow only the production domain, plus `localhost` for development.
   - Preview deployments get other addresses, so Help near you won't work on previews.
   - Allowing all of `*.vercel.app` would let any Vercel site use the key, so don't.
4. **Forward the API through Vercel and stamp each request with the origin secret (written in `apps/gravecast/vercel.json`).**
   - One entry in `routes`: `/api/(.*)` to `https://t5hjk3xhvbtlwr35mrpfr6q3hy0xrqxa.lambda-url.ap-south-1.on.aws/api/$1`, with a `request.headers` transform that sets `x-origin-secret` from the `ORIGIN_SECRET` environment variable (listed in the transform's `env`). `set` replaces any value a visitor sends. Source: Vercel docs, "Restricting your origin to Vercel traffic" (vercel.com/docs/routing/rewrites).
   - The app never calls `/health`, so there is no route for it. The workflow checks the Function URL's `/health` directly.
   - The catch-all rewrite now excludes `api/` (`/:path((?!api/).*)`), so the single-page fallback can never answer an API path, whatever order Vercel applies `routes` and `rewrites` in.
   - The Function URL is written into the file because a destination can't read environment variables. It is public, so that is fine.
   - **Not yet verified, test on the first preview deployment:** (1) `/api/channel/echoes/DEMO?since=1` through the site keeps its query string (the app's echo reads need it); (2) a POST to `/api/channel/mailrun` through the site returns JSON, not the app's HTML; (3) `/lantern/` still opens and the site's other pages still load.
   - Lantern's service worker already ignores `/api/` paths for caching, and its mail runs use the page's own address, so Chat and Background Sync keep working.
   - Vercel sends the visitor's address in `x-forwarded-for`. The API doesn't read it (`client_key` uses the socket address, which behind the Web Adapter is the adapter itself), so rate limits are one shared bucket per Lambda instance whether or not the proxy is used.
   - Proxied requests count toward Vercel's data transfer and request limits. They are small JSON calls, but check the Hobby allowances again before launch.
   - What this does and doesn't do: calls that go straight to the Function URL get 403, so only our site reaches the API. It is not user authentication. Anyone can still use the site, so rate limits and reserved concurrency still matter.

## 4. Code (next session, before the workflow is pushed)

1. **Run the app on Lambda as a web app, with no handler function.**
   - Lambda Web Functions (the native option) supports only Node.js for now, so it can't run our Python API. Source: the AWS Lambda Web Adapter README, github.com/awslabs/aws-lambda-web-adapter.
   - So: AWS Lambda Web Adapter. Add one `COPY` line to the Dockerfile; uvicorn runs FastAPI as it does today, with no code change. The `lifespan` startup still runs.
   - Image: `python:3.12-slim` plus `COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:1.1.0 /lambda-adapter /opt/extensions/lambda-adapter`. uvicorn listens on port 8080, the adapter's default. Set `AWS_LWA_READINESS_CHECK_PATH=/health`.
   - Move to Web Functions if it adds Python later.
2. **`DynamoChannelStore`** (written, with tests) in `app/modules/channel/dynamo_store.py`, behind the existing `ChannelStore` protocol. `GRAVECAST_CHANNEL_STORE` picks it; SQLite stays for local work.
   - One table, keys `pk` and `sk`. Each message is one transaction: it moves a global `seq` counter (checked in the same transaction, so seq follows commit order), stores the message, stores a msgid marker (so a retry never posts twice), and drops the echo's oldest message once it holds `keep`. Reads are strongly consistent.
   - Settings in `config.py` with `GRAVECAST_*` names: `CHANNEL_STORE`, `CHANNEL_TABLE`, `CHANNEL_REGION`, `CHANNEL_WRITE_ATTEMPTS`, `CHANNEL_DEDUPE_DAYS`, `CHANNEL_AWS_TIMEOUT_SECONDS`.
   - Tests run against moto, an in-memory fake of DynamoDB, never real AWS. They cover seq order, repeats (also all at once), pruning, many writers at once, created channels and their cap, and AWS failures answering 503 "busy" with no details.
   - Not tested against real DynamoDB. Moto does not check reserved words or the real cancellation-reason format; the first live mail run is the real test.
3. **`apps/api/Dockerfile.lambda`** (written) on `python:3.12-slim` with the adapter (item 1; the adapter ships its own runtime client, so no AWS base image is needed), plus `apps/api/.dockerignore` (leave out `.venv`, `tests`, `.env`, caches).
4. **`.github/workflows/deploy-api.yml`** (written, in `.github/workflows/`):
   - `paths`: `apps/api/**` and the workflow file. Build context: `apps/api`.
   - **No fallbacks for the role, repository or function names.** With a secret missing, the run fails instead of deploying somewhere else.
5. **`.github/workflows/ci.yml`** on pull requests that touch `apps/api`: API `pytest`. GitHub Actions is for the backend only. Vercel builds Groove UI and the website on every push.
6. Vision doc: in §9, add a row for the container image in ECR, region `ap-south-1`, and the OIDC workflow, in place of SAM. In §7, change "zero cost" to "near zero" and add ECR storage to the free-tier table (see section 0, item 1).
7. **Origin secret check (written, with tests).** `app/common/origin_guard.py`: ASGI middleware that refuses every request unless `x-origin-secret` matches `GRAVECAST_ORIGIN_SECRET` (constant-time compare), answering 403 `ORIGIN_NOT_ALLOWED`. Only `/health` is open, so `/docs` and `/openapi.json` are closed too.
   - Several secrets, comma-separated, are accepted at once. Rotation: add the new value to the function, change Vercel's `ORIGIN_SECRET`, redeploy, then remove the old value.
   - Off when the variable is unset (local development). `Dockerfile.lambda` sets `GRAVECAST_REQUIRE_ORIGIN_SECRET=true`, so in Lambda the API refuses to start without a secret of at least 32 characters. No secret value is ever logged or returned.
   - Written and tested locally: with a real uvicorn server, no header or a wrong one gets 403, the right one gets 200, and `/health` answers without it. The Docker image itself has not been built here (no Docker on this machine); the first workflow run is its first build.

Known limit to state plainly: rate limits are kept in memory, so each running Lambda instance counts on its own. Reserved concurrency caps how many instances there are.

## Order of work

1. Settle the three decisions in section 0.
2. Section 1, steps 1 to 4 (alert, role, ECR repository).
3. Section 4 code on branch `feat/ci-deploy`, tested locally with the Docker image.
4. DynamoDB table `gravecast-channel`, the policy on the execution role, then the two `GRAVECAST_CHANNEL_*` variables on the function (section 1, steps 5 to 7).
5. Add the GitHub secrets `AWS_ROLE_ARN` and `ECR_REPOSITORY` (section 2, step 1). The workflow has no fallbacks, so it fails without them. Then push the workflow on `main` (or run it by hand). The first run pushes the image.
6. Generate the origin secret and keep it. Create the function with `GRAVECAST_ORIGIN_SECRET` set, since the API refuses to start without it, then its Function URL and log retention (section 1, steps 7 to 9). Add the GitHub secrets `LAMBDA_FUNCTION_NAME` and `LAMBDA_FUNCTION_URL`.
7. Set `ORIGIN_SECRET` on Vercel to the same value. The `/api` route in `vercel.json` already holds the Function URL (section 3, step 4), then create the Vercel project and set its other environment variables (section 3).
8. Run the workflow again. Check `/health`, a link scan, a Chat mail run and Help near you on the live site.
9. Check the lock: a direct call to `<Function URL>/api/channel/echoes/EMERGENCY` returns 403, the same path through the Vercel site returns 200, and `<Function URL>/health` still answers (the workflow's health check calls it directly).
