import { GraphData } from "../Types/GraphTypes";
import { NetworkGraphNode } from "../Types/NetworkTypes";
import dummydata from "../test/data/ServerDefaults";
import { networkNodesToGraphData } from "../util/QuorumParsing";
import { haltingAnalysis, HaltingFailure } from "../util/HaltingAnalysis";

import healthy from "../test/data/HealthyQuorum";
import highlyDependent from "../test/data/HighlyDependent";
import { simple as highlyDependentSubquorum } from "../test/data/HighlyDependentSubquorum";
import halfDead from "../test/data/HalfDead";
import preHalt from "../test/data/PreHalt";

const networkData = dummydata as { nodes: NetworkGraphNode[] };

type ExampleKey =
  | "healthy"
  | "halfDead"
  | "highlyDependent"
  | "highlyDependentSubquorum"
  | "preHalt";

type Action =
  | {
      type: "USE_EXAMPLE";
      name: string;
      data: NetworkGraphNode[];
      failures: HaltingFailure[];
    }
  | { type: "SELECT_FAILURE"; data: HaltingFailure }
  | { type: "SELECT_NODE"; node: NetworkGraphNode; failures: HaltingFailure[] }
  | { type: "UNKNOWN" };

export function fetchQuorum(): Action {
  return showExample("preHalt");
}

const examples: Map<ExampleKey, NetworkGraphNode[]> = new Map([
  ["healthy", healthy],
  ["halfDead", halfDead],
  ["highlyDependent", highlyDependent],
  ["highlyDependentSubquorum", highlyDependentSubquorum],
  ["preHalt", preHalt]
]);

export function showExample(example: string): Action {
  const nodes = examples.get(example as ExampleKey);
  if (!nodes) {
    throw new Error("Unknown example key");
  }
  const failures = haltingAnalysis(nodes, { numberOfNodesToTest: 3 });
  return {
    type: "USE_EXAMPLE",
    name: example,
    data: nodes,
    failures: failures
  };
}

export function selectFailure(failure: HaltingFailure): Action {
  return { type: "SELECT_FAILURE", data: failure };
}

export function selectNode(name: string, nodes: NetworkGraphNode[]): Action {
  const node = nodes.find(n => n.node === name);
  if (!node) return { type: "UNKNOWN" };
  const failures = haltingAnalysis(nodes, {
    numberOfNodesToTest: 3,
    rootNode: name
  });
  return { type: "SELECT_NODE", node, failures };
}

export type QuorumStateShape = {
  transitiveQuorum: GraphData;
  validExamples: string[];
  failures: HaltingFailure[];
  selectedFailure?: HaltingFailure;
  selectedNode?: NetworkGraphNode;
};

export default function reducer(
  state: QuorumStateShape = {
    validExamples: Array.from(examples.keys()),
    transitiveQuorum: {
      links: [],
      nodes: []
    },
    failures: [],
    selectedFailure: undefined
  },
  action: Action = { type: "UNKNOWN" }
) {
  switch (action.type) {
    case "USE_EXAMPLE":
      return {
        ...state,
        transitiveQuorum: networkNodesToGraphData(action.data),
        failures: action.failures,
        exampleName: action.name,
        selectedFailure: action.failures[0],
        selectedNode: action.data.find(n => n.distance === 0)
      };
    case "SELECT_NODE":
      return {
        ...state,
        selectedNode: action.node,
        failures: action.failures,
        selectedFailure: action.failures[0]
      };
    case "SELECT_FAILURE":
      return {
        ...state,
        selectedFailure: action.data
      };
    default:
      return state;
  }
}
