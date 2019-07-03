import React from "react";
import { selectNode } from "../Modules/quorum";
import { useMappedState, useDispatch } from "redux-react-hook";

import { NetworkGraphNode } from "../Types/NetworkTypes";

type StateSelection = {
  nodes: NetworkGraphNode[];
  selectedNode: NetworkGraphNode;
};
const NodeSelection = () => {
  const { nodes, selectedNode } = useMappedState<StateSelection>(state => {
    return {
      nodes: state.quorum.transitiveQuorum.nodes,
      selectedNode: state.quorum.selectedNode
    };
  });
  const dispatch = useDispatch();
  const change = (value: string) => {
    const node = nodes.find(n => n.node === value);
    if (node) {
      dispatch(selectNode(value, nodes));
    }
  };
  return (
    <div>
      <select
        value={selectedNode && selectedNode.node}
        onChange={e => change(e.target.value)}
      >
        {/* <datalist id="nodeNames"> */}
        {nodes.map(n => (
          <option key={n.node} value={n.node}>
            {n.node}
          </option>
        ))}
        {/* </datalist> */}
      </select>
    </div>
  );
};

export default NodeSelection;
