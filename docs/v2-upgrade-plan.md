# Upgrade plan: fork → latest microsoft/azurechat (v2) with no infra or app-registration changes

**Status: planned, not yet executed.** This document is the reviewed implementation plan for upgrading this fork to upstream `microsoft/azurechat` at commit `09c549f` (latest `main`, Mar 2025).

## Context and verdict

This repo is a fork frozen at a **Nov 2023 v1.2.0 base** (upstream commit `601086b`) with ~12 files of customizations: branding ("Azure Chat for OBGYN"), BlazerID login button, PHI disclaimers, chat-input placeholder, admin-gated change log, and a hardened GitHub Actions deploy workflow. Upstream is now a **v2 rewrite** adding Personas, Prompt Library, Extensions, DALL-E image generation, vision input, and a reworked RAG pipeline.

**The upgrade is compatible with the current Azure setup.** Verified against both codebases:

- v2 has **no build/boot env validation** — every Azure service client is constructed lazily per-request, and `npm run build` succeeds with an empty env. Missing services fail only at click-time.
- Cosmos DB defaults are unchanged (`chat` database / `history` container, partition key `/userId`, userId = SHA-256 hex of the user's email — identical to v1), so **existing chat history carries over automatically**. The only data-plane addition is a new `config` container.
- Auth uses the **same env var names and the same redirect URI** (`/api/auth/callback/azure-ad`) — **no app registration change needed**. Key-based auth is fully supported for every service; nothing requires managed identity except the Extensions feature (Key Vault), which is gated off.
- Upstream's own `docs/migration.md` documents this exact v1→v2 path (env rename + `config` container).

**Decisions made:**

- AI Search + Document Intelligence were removed and will be re-added later → chat-with-file ships **hidden** and auto-enables when its app settings are set. No code change needed at that point.
- DALL-E / image generation: not wanted → stays hidden (no Storage account or DALL-E deployment exists anyway).
- Personas, Prompt Library, vision input (Cosmos + existing OpenAI only): **enabled**.
- Extensions (requires Key Vault via managed identity): gated behind an explicit opt-in env var, off by default.

**Design principle:** feature flags are derived from **env-var presence, evaluated server-side at request time**. The deploy builds in GitHub Actions where App Service settings don't exist, so `NEXT_PUBLIC_*` build-time vars can never work — but the authenticated layout is already `force-dynamic`, so runtime reads are safe. Lighting up a feature later = set app settings + restart. No code change, no redeploy.

---

## 1. Git strategy — "theirs-tree" merge (no force push, keeps ancestry)

Fork base `601086b` is an ancestor of upstream `main`, so a real merge keeps history connected for future upstream pulls, and the branch only gains commits (plain push, no rewrite).

```bash
cd <repo>
git remote add upstream https://github.com/microsoft/azurechat.git
git fetch upstream main
git checkout claude/azure-setup-compatibility-6dra8z
git tag v1-final 487c951       # rollback anchor (pre-upgrade tip)

# Merge commit whose tree is byte-identical to upstream — no conflicts possible.
git merge -s ours --no-commit upstream/main
git read-tree -u --reset upstream/main
git commit -m "Merge upstream microsoft/azurechat v2 (09c549f), adopting upstream tree wholesale"

git diff upstream/main --stat  # MUST print nothing before proceeding
```

> Note: the `read-tree --reset` step intentionally wipes every non-upstream file from the tree — including the fork's workflows and this plan document. Restore them immediately after:

```bash
git checkout v1-final -- .github/workflows/open-ai-app.yml .github/workflows/azure-dev-validate.yml
git checkout v1-final -- docs/v2-upgrade-plan.md   # this file (if kept)
git commit -m "Restore hardened deployment workflows from v1 fork"
```

Then the follow-up commits (sections 2–5), `git push -u origin claude/azure-setup-compatibility-6dra8z`, and a PR to `main`. Merging the PR triggers the deploy workflow — **complete the Azure configuration checklist (section 7) first**.

## 2. Feature-flag module (new code, 3 small files)

- **`src/features/common/feature-flags-model.ts`** — `FeatureFlags` interface + `DEFAULT_FEATURE_FLAGS` (all false except `multimodalEnabled: true`). Importable from client and server.
- **`src/features/common/feature-flags.ts`** — server-only (`import "server-only"`). `GetFeatureFlags()` derives from env presence (`has = v => !!v && v.trim().length > 0`, `mi = () => process.env.USE_MANAGED_IDENTITIES === "true"`):
  - `speechEnabled` = `AZURE_SPEECH_KEY` + `AZURE_SPEECH_REGION` set
  - `chatWithFileEnabled` = `AZURE_SEARCH_NAME` + (`mi()` or `AZURE_SEARCH_API_KEY`) + `AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT` + (`mi()` or `AZURE_DOCUMENT_INTELLIGENCE_KEY`) + `AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME`
  - `imageGenEnabled` = `AZURE_OPENAI_DALLE_API_INSTANCE_NAME` + `AZURE_OPENAI_DALLE_API_DEPLOYMENT_NAME` + (`mi()` or `AZURE_OPENAI_DALLE_API_KEY`) + `AZURE_STORAGE_ACCOUNT_NAME` + (`mi()` or `AZURE_STORAGE_ACCOUNT_KEY`)
  - `extensionsEnabled` = `EXTENSIONS_ENABLED === "true"` **and** `AZURE_KEY_VAULT_NAME` set (explicit opt-in — upstream's `key-vault.ts` uses `DefaultAzureCredential` unconditionally, so it needs a managed identity with Key Vault secret permissions)
  - `multimodalEnabled` = `MULTIMODAL_ENABLED !== "false"` (opt-out; vision needs only the chat deployment)
- **`src/features/globals/feature-flags-context.tsx`** — `"use client"` React context: `FeatureFlagsProvider` + `useFeatureFlags()`.

**Wire-up:** in `src/app/(authenticated)/layout.tsx` (already `export const dynamic = "force-dynamic"`), wrap the existing `<div className={cn("flex flex-1 items-stretch")}>` inside `<AuthenticatedProviders>` with `<FeatureFlagsProvider flags={GetFeatureFlags()}>`.

## 3. UI gating (per file)

| File | Change |
|---|---|
| `src/features/main-menu/main-menu.tsx` (server component) | `GetFeatureFlags()`; hide the Extensions `MenuItem` (`href="/extensions"`) unless `extensionsEnabled`. Chat/Persona/Prompts tiles stay; Reporting is already admin-gated. |
| `src/features/chat-page/chat-input/chat-input.tsx` (client) | `useFeatureFlags()`; wrap `<AttachFile>` in `chatWithFileEnabled`, `<ImageInput/>` in `multimodalEnabled`, `<Microphone/>` in `speechEnabled`. `PromptSlider` stays. (Gating the mic also gates TTS — TTS only fires after mic use.) |
| `src/features/chat-page/chat-header/chat-header.tsx` (client) | Wrap `<ExtensionDetail>` in `extensionsEnabled`; wrap `<DocumentDetail>` in `chatWithFileEnabled \|\| props.chatDocuments.length > 0` (old file-chats keep their document badge). |
| `src/features/chat-home-page/chat-home.tsx` (server component) | Hide the "Extensions" section + `<AddExtension/>` slider unless `extensionsEnabled`. Personas section stays. |
| `src/app/(authenticated)/extensions/page.tsx` | Deep-link guard: return `<DisplayError>` when `!extensionsEnabled` (the middleware matcher doesn't cover `/extensions`). |

## 4. Backend gating (correctness, not just cosmetics)

1. **`src/features/chat-page/chat-services/chat-api/chat-api-extension.ts` — required fix.** It unconditionally calls `openAI.beta.chat.completions.runTools({ ... tools: extensions })`. With image-gen off and no thread extensions, `tools` is `[]` and Azure OpenAI rejects an empty tools array (HTTP 400) — **basic chat would break**. When `extensions.length === 0`, call `openAI.beta.chat.completions.stream(...)` instead (the same pattern `chat-api-multimodal.tsx` already uses, so the return type is compatible). Side benefit: basic chat then works even on model deployments without tool-calling support.
2. **`chat-api-default-extensions.ts`** — register the `create_img` tool only when `imageGenEnabled`.
3. **`src/features/theme/theme-config.ts` + `chat-api.ts`** — remove the create_img advertisement from `CHAT_DEFAULT_SYSTEM_PROMPT`; export it separately (e.g. `CHAT_IMAGE_GEN_PROMPT`) and append it in `chat-api.ts` only when `imageGenEnabled`. Otherwise the model is told it can generate images and will try.
4. **Server-side guards** (UI hiding isn't security; server actions are directly invokable):
   - `chat-document-service.ts` → `CrackDocument`: return an ERROR `ServerActionResponse` when `!chatWithFileEnabled`.
   - `chat-api-rag-extension.ts` / `POST /api/document` route: 404 when `!chatWithFileEnabled`.
   - `extension-service.ts` → guard `CreateExtension` / `UpdateExtension` / `DeleteExtension` (they touch Key Vault) with `extensionsEnabled`; read paths stay open (Cosmos-only, used by chat pages).
   - Speech needs no guard — `GetSpeechToken` already returns a structured error when the vars are unset.

## 5. Re-apply fork customizations on the v2 tree

1. **AI name** — `src/features/theme/theme-config.ts`: `AI_NAME = "Azure Chat for OBGYN"`.
2. **Login** — `src/features/auth-page/login.tsx`: button label `Microsoft 365` → `BlazerID`; `CardDescription` → "Login in with your BlazerID". The GitHub button already auto-hides when `AUTH_GITHUB_ID` is unset (keep that app setting absent).
3. **PHI disclaimer** (red alert box, classes `p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400`, text: *Please remember **NOT** to share **sensitive or PHI data**.*):
   - `src/features/chat-home-page/chat-home.tsx` — first child of the `container max-w-4xl` div.
   - `src/features/chat-page/chat-page.tsx` — inside `<ChatMessageContentArea>` when `messages.length === 0`.
4. **Placeholder** — `chat-input.tsx`: `placeholder="Send a message (Press Shift + Enter for new line)"` on `<ChatTextInput>` (the prop wins over the component default).
5. **Auth scope tweak (data-continuity insurance)** — `src/features/auth-page/auth-api.ts`: change scope `"openid profile User.Read"` → `"openid profile email User.Read"`. v2 dropped the `email` scope and falls back to `preferred_username`; if UPN ≠ mail for UAB accounts, every user's history (keyed on SHA-256 of email) would appear empty. Additive scope; no app-registration change. (`User.Read` is a default-consented Graph permission — if sign-in ever throws an AADSTS consent error, drop `User.Read` from the scope; the only loss is the profile photo, which already degrades gracefully.)
6. **Dropped**: change-log admin gating (the feature no longer exists in v2), v1 infra/README tweaks.
7. Update `src/.env.example` comments documenting `EXTENSIONS_ENABLED` / `MULTIMODAL_ENABLED` and the per-feature var groups.

## 6. Deploy workflow

Keep the fork's hardened `.github/workflows/open-ai-app.yml` (restored in section 1) — v2 kept the same layout (`./src`, `output: "standalone"`, startup `node server.js`), so no path changes. One edit: **Node `24.x` → `22.x`** to match upstream's tested envelope (Next 14.0.4; App Service runtime `NODE|22-lts`). Keep `azure-dev-validate.yml` as-is.

## 7. Azure configuration checklist (portal only — do BEFORE merging the PR)

- **Cosmos DB**: in database `chat`, create container **`config`** with partition key **`/userId`**.
- **App Service general settings**: verify runtime stack **Node 22 LTS**. Startup command is re-asserted by the workflow (`node server.js`).
- **App settings — safe to do ahead of time** (v1 ignores the new names):
  - Add `AZURE_OPENAI_API_KEY` = value of the current `OPENAI_API_KEY`. Keep the old setting until after a successful cutover, then delete it.
  - Set `AZURE_OPENAI_API_VERSION` = `2024-10-21` (the old preview value predates tools/vision). Do this at cutover time, not before — v1 runs against the old value.
  - Delete `AZURE_SEARCH_API_VERSION` and `PUBLIC_SPEECH_ENABLED` after cutover (both dropped in v2). Don't set `USE_MANAGED_IDENTITIES` or `AUTH_GITHUB_*`.
  - Keep unchanged: `AZURE_OPENAI_API_INSTANCE_NAME`, `AZURE_OPENAI_API_DEPLOYMENT_NAME`, `AZURE_COSMOSDB_URI`/`KEY`, `NEXTAUTH_URL`/`SECRET`, `AZURE_AD_CLIENT_ID`/`SECRET`/`TENANT_ID`, `ADMIN_EMAIL_ADDRESS`.
- **Check the chat model deployment.** v2 is designed around gpt-4o. If the existing deployment is an older model (e.g. gpt-35-turbo), basic chat still works (thanks to the section-4 no-tools path), but vision won't — set `MULTIMODAL_ENABLED=false` to hide the image button. Deploying a newer model (gpt-4o) on the **existing** Azure OpenAI resource is a portal action, not new infrastructure, and can be done any time.
- **Later, to light up features (no code change — set app settings + restart):**
  - **Chat-with-file** (when Search + Document Intelligence are re-added): `AZURE_SEARCH_NAME`, `AZURE_SEARCH_API_KEY`, `AZURE_SEARCH_INDEX_NAME`, `AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT`, `AZURE_DOCUMENT_INTELLIGENCE_KEY`, `AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME` (needs an embeddings deployment, e.g. `text-embedding-3-small`, on the OpenAI resource). Optional: `MAX_UPLOAD_DOCUMENT_SIZE`.
  - **Speech**: `AZURE_SPEECH_KEY` + `AZURE_SPEECH_REGION`.
  - **Image generation** (not planned): all `AZURE_OPENAI_DALLE_*` + `AZURE_STORAGE_ACCOUNT_NAME`/`KEY`.
  - **Extensions** (needs managed identity + Key Vault secret permissions): `EXTENSIONS_ENABLED=true` + `AZURE_KEY_VAULT_NAME`.

## 8. Verification

1. **CI gate**: `cd src && npm install && npm run build` with an empty env on Node 22 (must succeed — v2 has no env validation); `npm run lint`.
2. **Local flag-matrix** (`npm run dev`; no Azure calls needed to verify rendering): with no optional vars → mic/paperclip/extensions absent, PHI alerts present, login shows BlazerID only. Add dummy `AZURE_SPEECH_*` → mic reappears (proves flags are runtime-read, not build-baked).
3. **Post-deploy click-through** (after the PR merge to `main` triggers the workflow):
   - Sign in with BlazerID; **old chat history is visible** (the key continuity check).
   - A new chat streams normally (proves the no-tools path against the existing model deployment).
   - "Create an image of X" → the model declines gracefully (tool not registered or advertised).
   - Prompts page: create a prompt (proves the `config` container works); Personas page works; Reporting renders for the admin, non-admins get `/unauthorized`.
   - Disabled surfaces are absent; the `/extensions` deep-link and a direct `POST /api/document` return the guard errors.
   - App Service log stream is clean on the home/chat paths.
4. **Rollback**: `main` still points at v1 until the PR merges; the `v1-final` tag re-deploys via a revert of the merge on `main`. Keep the old `OPENAI_API_KEY` app setting until stable (v2 ignores it).

## Commit sequence on `claude/azure-setup-compatibility-6dra8z`

1. Theirs-tree merge of upstream v2 (tree == upstream, verified with `git diff upstream/main`).
2. Restore hardened workflows (+ this doc) and bump workflow Node to 22.
3. Feature-flag module + provider + UI gating.
4. Backend gating (empty-tools stream path, `create_img` registration, system prompt split, server guards).
5. Re-apply customizations + auth scope tweak + `.env.example` docs.

Then push, open a PR to `main`; merging it deploys — after the section-7 checklist is done.
