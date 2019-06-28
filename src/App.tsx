import React from "react";
import Header from "./Components/Header";
import NodeGraph from "./Components/NodeGraph";
import ExamplePicker from "./Components/ExamplePicker";
import InfoPanel from "./Components/InfoPanel";
import InfoContainer from "./Components/InfoContainer";
import FailureDisplay from "./Components/FailureDisplay";

const App: React.FC = () => {
  return (
    <React.Fragment>
      <Header />
      <InfoContainer>
        <InfoPanel title="Node Selection"></InfoPanel>
        <InfoPanel title="Failures">
          <FailureDisplay>
            <ExamplePicker />
          </FailureDisplay>
        </InfoPanel>
      </InfoContainer>

      <NodeGraph />
    </React.Fragment>
  );
};

export default App;
