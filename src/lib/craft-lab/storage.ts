import type { CraftExperiment } from "@/lib/craft-lab/types";

const STORAGE_KEY = "navashakthi_craft_lab_experiments_v1";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readExperiments(): CraftExperiment[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as CraftExperiment[];
  } catch {
    return [];
  }
}

function writeExperiments(experiments: CraftExperiment[]): void {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(experiments),
    );
  } catch {
    // Ignore localStorage failures in the prototype.
  }
}

export function getCraftLabExperiments(): CraftExperiment[] {
  return readExperiments();
}

export function getCraftLabExperiment(
  id: string,
): CraftExperiment | null {
  return (
    readExperiments().find(
      (experiment) => experiment.id === id,
    ) ?? null
  );
}

export function saveCraftLabExperiment(
  experiment: CraftExperiment,
): CraftExperiment {
  const experiments = readExperiments();

  const existingIndex = experiments.findIndex(
    (item) => item.id === experiment.id,
  );

  if (existingIndex >= 0) {
    experiments[existingIndex] = experiment;
  } else {
    experiments.unshift(experiment);
  }

  writeExperiments(experiments);

  if (isBrowser()) {
    window.dispatchEvent(
      new CustomEvent("navashakthi:craft-lab-updated"),
    );
  }

  return experiment;
}

export function deleteCraftLabExperiment(
  id: string,
): void {
  const experiments = readExperiments().filter(
    (experiment) => experiment.id !== id,
  );

  writeExperiments(experiments);

  if (isBrowser()) {
    window.dispatchEvent(
      new CustomEvent("navashakthi:craft-lab-updated"),
    );
  }
}

export function clearCraftLabExperiments(): void {
  writeExperiments([]);

  if (isBrowser()) {
    window.dispatchEvent(
      new CustomEvent("navashakthi:craft-lab-updated"),
    );
  }
}