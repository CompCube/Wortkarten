import { InMemoryCardRepository } from "./memory-repository";
import { describeCardRepository } from "./testing/repository-contract";

describeCardRepository("memòria", async () => new InMemoryCardRepository());
