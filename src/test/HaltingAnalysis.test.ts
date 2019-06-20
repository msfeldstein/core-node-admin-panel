import { haltingAnalysis } from "../util/HaltingAnalysis";
import healthy from "./data/HealthyQuorum";
import highlyDependent from "./data/HighlyDependent";
import cyclical from "./data/CyclicalUnhealthy";

describe("halting analysis", () => {
  it("must return an empty set for a healthy quorum", () => {
    const failureCases = haltingAnalysis(healthy, 1);
    expect(failureCases).toHaveLength(0);
  });

  it("must return a node that is too highly depended on", () => {
    const failureCases = haltingAnalysis(highlyDependent, 1);
    expect(failureCases).toHaveLength(1);
    expect(failureCases[0].vulnerableNodes[0]).toHaveProperty("node", "e");
  });

  it("must not infinite loop on cycles", () => {
    const failureCases = haltingAnalysis(cyclical);
    expect(failureCases).toHaveLength(2);
  });
});

export {};