import "fake-indexeddb/auto";
import { describeCardRepository } from "@wortkarten/core/testing";
import { createIdbCardRepository } from "./idb-repository";

let counter = 0;

// Cada test obre una base de dades amb nom nou, així no es contaminen entre ells.
describeCardRepository("IndexedDB", async () =>
  createIdbCardRepository(`wortkarten-test-${counter++}`),
);
