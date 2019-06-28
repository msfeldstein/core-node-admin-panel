import React, { FunctionComponent } from "react";
import s from "./InfoPanels.module.css";

const InfoContainer: FunctionComponent = props => {
  return <div className={`${s.Container}`}>{props.children}</div>;
};

export default InfoContainer;
