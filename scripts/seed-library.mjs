// Seeds the shared persona and prompt library into Cosmos DB.
//
// Usage: node scripts/seed-library.mjs <admin-email>
//
// <admin-email> must be an address listed in the app's ADMIN_EMAIL_ADDRESS,
// with the exact casing the identity provider returns at sign-in — the app
// hashes the session email verbatim to derive the document partition key.
//
// Reads Cosmos connection settings from src/.env.local. Documents use fixed
// ids and are upserted, so the script is safe to re-run after content edits.

import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(
  new URL("../src/package.json", import.meta.url)
);
const { CosmosClient } = require("@azure/cosmos");

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const loadEnvFile = (filePath) => {
  const env = {};
  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    let value = match[2];
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
  return env;
};

const adminEmail = process.argv[2];
if (!adminEmail || !adminEmail.includes("@")) {
  console.error("Usage: node scripts/seed-library.mjs <admin-email>");
  process.exit(1);
}

const env = loadEnvFile(path.join(repoRoot, "src", ".env.local"));
const endpoint = env.AZURE_COSMOSDB_URI;
const key = env.AZURE_COSMOSDB_KEY;
if (!endpoint || !key) {
  console.error("AZURE_COSMOSDB_URI / AZURE_COSMOSDB_KEY missing from src/.env.local");
  process.exit(1);
}

const dbName = env.AZURE_COSMOSDB_DB_NAME || "chat";
const historyName = env.AZURE_COSMOSDB_CONTAINER_NAME || "history";
const configName = env.AZURE_COSMOSDB_CONFIG_CONTAINER_NAME || "config";

const userId = createHash("sha256").update(adminEmail).digest("hex");

// createdAt is staggered so list order (createdAt DESC) matches array order.
// The chat home page surfaces the first three personas as suggestions.
const base = Date.now();
const stamp = (index) => new Date(base - index * 1000).toISOString();

const personas = [
  {
    id: "seed-persona-guideline-summarizer",
    name: "Guideline & Evidence Summarizer",
    description:
      "Standard-of-care summaries from AUA, SUFU, AUGS, and ACOG with evidence levels.",
    personaMessage: `You summarize society guidance and clinical evidence for an academic urogynecology audience.

- Unless asked for another length, produce a one-page summary structured as: background, key recommendations, and practice implications.
- Name the guideline, issuing society, and publication or amendment year for every recommendation you cite.
- Distinguish strong recommendations from conditional ones, and state the evidence grade the society assigned (e.g., Grade A/B/C, clinical principle, expert opinion).
- When societies disagree (e.g., AUA/SUFU vs. AUGS vs. ACOG), say so explicitly and summarize each position.
- Never fabricate a citation or recommendation. If you are not certain a statement reflects current guidance, flag it clearly and suggest how to verify it in the primary source.`,
  },
  {
    id: "seed-persona-manuscript-editor",
    name: "Manuscript & Peer Review Editor",
    description:
      "Structured critique of drafts, reviews, and submitted manuscripts.",
    personaMessage: `You are a senior academic editor in female pelvic medicine and reconstructive surgery (urogynecology).

When given a draft manuscript, review, abstract, or grant section:
- Assess structure and logical flow, completeness of the evidence base, missing considerations a peer reviewer would raise, and any claims that overstate the cited evidence.
- Check fit with the applicable reporting standard (PRISMA for reviews, CONSORT for trials, STROBE for observational studies) and note deviations.
- Organize feedback as: major points, then minor points, then line-level edits.
- When rewriting text, preserve the author's voice and terminology; offer revised wording rather than simply describing the problem.
- Be direct about weaknesses — the goal is a stronger submission, not reassurance.`,
  },
  {
    id: "seed-persona-talk-abstract-coach",
    name: "Talk & Abstract Coach",
    description:
      "Summary statements, structured abstracts, and slide outlines for academic talks.",
    personaMessage: `You help prepare conference abstracts, academic talks, and presentation materials in urogynecology.

- For abstracts: respect the stated word limit and structured headings (Objective, Methods, Results, Conclusions) exactly, and keep results quantitative where data is provided.
- For talk openings and summary statements: always offer 2–3 variants in different registers (formal, narrative, forward-looking) so the speaker can choose.
- For slide outlines: propose a slide-by-slide structure with a one-line takeaway per slide and brief speaker notes, sized to the stated talk length.
- Match the audience — a specialty society meeting, grand rounds, and a patient-facing talk each call for different depth and language.
- Keep language tight; cut filler and hedging unless the evidence genuinely warrants it.`,
  },
];

const prompts = [
  {
    id: "seed-prompt-guideline-summary",
    name: "One-page guideline summary",
    description:
      "Provide a one-page summary reflecting the current standard of care as mandated by [SOCIETY, e.g., AUA/SUFU] regarding the role of [INTERVENTION/TEST] in the condition of [CONDITION]. Structure it as: background, key recommendations with strength and evidence level, and practice implications. Name the guideline and year, and flag any uncertainty about sources.",
  },
  {
    id: "seed-prompt-article-summary",
    name: "Two-page article summary",
    description:
      "Please review the following and provide a two-page summary written for an academic clinical audience, covering: objective, methods, key findings with effect sizes where reported, limitations, and clinical implications. Article text: [PASTE ARTICLE OR UPLOAD DOCUMENT]",
  },
  {
    id: "seed-prompt-draft-critique",
    name: "Critique my draft",
    description:
      "Review the following draft and identify: (1) important considerations that are missing, (2) structural or flow issues, (3) statements that overstate the cited evidence, and (4) gaps a peer reviewer would likely flag. Organize as major points, then minor points. Draft: [PASTE DRAFT]",
  },
  {
    id: "seed-prompt-summary-statements",
    name: "Summary statement variants",
    description:
      "Draft three versions of a 2–3 sentence opening summary statement for a talk on [TOPIC], each in a different register: (1) formal/academic, (2) narrative, (3) forward-looking. The audience is [AUDIENCE, e.g., specialty society meeting].",
  },
  {
    id: "seed-prompt-structured-abstract",
    name: "Structured abstract",
    description:
      "Draft a [WORD LIMIT]-word structured abstract (Objective / Methods / Results / Conclusions) for submission to [CONFERENCE OR JOURNAL], based on the following results or draft. Keep the Results section quantitative. Source material: [PASTE RESULTS OR DRAFT]",
  },
  {
    id: "seed-prompt-peer-review",
    name: "Peer-review report",
    description:
      "Write a formal peer review of the following manuscript in constructive journal-review tone, structured as: brief summary of the work, major concerns, minor concerns, and a recommendation (accept / minor revision / major revision / reject) with rationale. Manuscript: [PASTE MANUSCRIPT OR UPLOAD DOCUMENT]",
  },
  {
    id: "seed-prompt-reviewer-response",
    name: "Response to reviewers",
    description:
      "Draft a point-by-point response to the following reviewer comments. For each point: restate the comment, give a courteous response, and propose specific revision text for the manuscript. Reviewer comments: [PASTE COMMENTS] Relevant manuscript text: [PASTE TEXT]",
  },
  {
    id: "seed-prompt-patient-handout",
    name: "Patient education handout",
    description:
      "Create a one-page patient education handout about [CONDITION OR PROCEDURE] at a 6th–8th-grade reading level, covering: what it is, treatment options, what to expect, and when to call the clinic. Use short sentences and avoid jargon.",
  },
  {
    id: "seed-prompt-evidence-table",
    name: "Evidence comparison table",
    description:
      "Create a comparison table of the treatment options for [CONDITION], with columns for: option, efficacy, level of evidence, key risks/adverse effects, and current guideline position (name the society and year). Note where evidence is limited or conflicting.",
  },
  {
    id: "seed-prompt-literature-gaps",
    name: "Literature gaps & future directions",
    description:
      "Based on the following review (or the topic of [TOPIC]), identify: understudied questions, methodological weaknesses of the existing literature, and 3–5 concrete future study designs that would address them (population, comparator, primary outcome). Source: [PASTE REVIEW OR LEAVE TOPIC ONLY]",
  },
  {
    id: "seed-prompt-specific-aims",
    name: "Specific aims polish",
    description:
      "Critique and tighten the following specific aims page. Assess: significance framing, independence of the aims, clarity of the hypotheses, and feasibility signals. Then provide a revised version that preserves my voice. Specific aims: [PASTE SPECIFIC AIMS]",
  },
  {
    id: "seed-prompt-journal-club",
    name: "Journal club guide",
    description:
      "From the following article, create a journal-club guide with: a 5-bullet summary, key critical-appraisal points (design, bias, statistics, generalizability), and 6 discussion questions. Article: [PASTE ARTICLE OR UPLOAD DOCUMENT]",
  },
];

const main = async () => {
  const client = new CosmosClient({ endpoint, key });
  const database = client.database(dbName);
  const history = database.container(historyName);
  const config = database.container(configName);

  for (const [index, persona] of personas.entries()) {
    const doc = {
      ...persona,
      userId,
      isPublished: true,
      type: "PERSONA",
      createdAt: stamp(index),
    };
    await history.items.upsert(doc);
    console.log(`persona upserted: ${persona.name}`);
  }

  for (const [index, prompt] of prompts.entries()) {
    const doc = {
      ...prompt,
      userId,
      isPublished: true,
      type: "PROMPT",
      createdAt: stamp(index),
    };
    await config.items.upsert(doc);
    console.log(`prompt upserted: ${prompt.name}`);
  }

  console.log(
    `\nSeeded ${personas.length} personas and ${prompts.length} prompts as ${adminEmail} (${userId.slice(0, 8)}…)`
  );
};

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
