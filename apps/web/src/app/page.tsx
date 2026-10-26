import { normalizeTerm } from "@wortkarten/core";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[640px] flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="font-display text-4xl font-semibold">Wortkarten</h1>
      <p className="text-muted">
        Targetes creades per IA, repàs amb repetició espaiada.
      </p>
      <p className="font-display text-2xl" data-testid="norm-demo">
        {normalizeTerm("  Richtung ")}
      </p>
      <button
        type="button"
        className="min-h-11 rounded-xl bg-accent px-6 font-semibold text-accent-text"
      >
        Crea les teves targetes
      </button>
    </main>
  );
}
