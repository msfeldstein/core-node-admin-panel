import React, { useState, FunctionComponent } from "react";
import { ReactComponent as Minus } from "../assets/Minus.svg";
import { ReactComponent as Plus } from "../assets/Plus.svg";
import s from "./InfoPanels.module.css";

type InfoPanelProps = {
  title: string;
};
const InfoPanel: FunctionComponent<InfoPanelProps> = ({ children, title }) => {
  const [showDetails, setShowDetails] = useState(true);
  let button = showDetails ? <Minus /> : <Plus />;
  let openClass = showDetails ? s.open : null;
  return (
    <div className={`${s.Panel} ${openClass}`}>
      <div className={s.HeaderRow}>
        <div className={s.Title}>{title}</div>
        <div
          className={s.OpenCloseButton}
          onClick={() => setShowDetails(!showDetails)}
        >
          {button}
        </div>
      </div>
      {showDetails ? children : <></>}
    </div>
  );
};

export default InfoPanel;
