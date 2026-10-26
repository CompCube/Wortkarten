// Hook SessionEnd: apunta al diari d'Obsidian què ha canviat en aquesta sessió.
// Només escriu noms de fitxers i missatges de commit, mai contingut.
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const cfgPath = path.join(root, ".claude", "hooks", "diari.config.json");
if (!fs.existsSync(cfgPath)) process.exit(0);
const { memDir } = JSON.parse(fs.readFileSync(cfgPath, "utf8").replace(/^\uFEFF/, ""));
if (!memDir || !fs.existsSync(memDir)) process.exit(0);

const run = (cmd) => {
  try { return execSync(cmd, { cwd: root, encoding: "utf8", timeout: 5000 }).trim(); }
  catch { return ""; }
};
const canvis = run("git status --short").split("\n").filter(Boolean).slice(0, 30);
const commits = run('git log --since="8 hours ago" --pretty=format:"%h %s"').split("\n").filter(Boolean).slice(0, 15);
if (!canvis.length && !commits.length) process.exit(0);

const ara = new Date();
const data = ara.toISOString().slice(0, 10) + " " + ara.toTimeString().slice(0, 5);
let txt = `\n## ${data}\n`;
if (commits.length) txt += "\nCommits:\n" + commits.map((c) => `- ${c}`).join("\n") + "\n";
if (canvis.length) txt += "\nFitxers sense commit:\n" + canvis.map((c) => `- \`${c}\``).join("\n") + "\n";

const diari = path.join(memDir, "diari.md");
if (!fs.existsSync(diari)) fs.writeFileSync(diari, "# Diari de sessions\n\nS'omple sol en tancar cada sessió de Claude Code.\n");
fs.appendFileSync(diari, txt);
