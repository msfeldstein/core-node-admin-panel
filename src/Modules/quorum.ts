import { GraphData } from "../Types/GraphTypes";
import { NetworkGraphNode } from "../Types/NetworkTypes";
import { networkNodesToGraphData } from "../util/QuorumParsing";
import { haltingAnalysis, HaltingFailure } from "../util/HaltingAnalysis";
import axios from "axios";
import { Dispatch } from "redux";

import healthy from "../test/data/HealthyQuorum";
import highlyDependent from "../test/data/HighlyDependent";
import { simple as highlyDependentSubquorum } from "../test/data/HighlyDependentSubquorum";
import halfDead from "../test/data/HalfDead";
import preHalt from "../test/data/PreHalt";

type ExampleKey =
  | "liveData"
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

// export const fetchQuorum: ActionCreator<
//   ThunkAction<Promise<ReduxAction>, IState, void>
// > = () => {
export function fetchQuorum() {
  return async (dispatch: Dispatch) => {
    const response = await axios.get("http://localhost:8080/quorum");
    const nodes = response.data.nodes as NetworkGraphNode[];
    const failures = haltingAnalysis(nodes, { numberOfNodesToTest: 2 });
    dispatch({ type: "USE_EXAMPLE", name: "actual", data: nodes, failures });
  };
}

const examples: Map<ExampleKey, NetworkGraphNode[]> = new Map([
  ["liveData", []],
  ["healthy", healthy],
  ["halfDead", halfDead],
  ["highlyDependent", highlyDependent],
  ["highlyDependentSubquorum", highlyDependentSubquorum],
  ["preHalt", preHalt]
]);

export function showExample(
  example: string
): Action | ((d: Dispatch) => Promise<void>) {
  if (example === "liveData") {
    return fetchQuorum();
  }
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
