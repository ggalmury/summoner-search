import React, { Fragment } from "react";
import { PulseLoader } from "react-spinners";

const Loading = (props) => {
  return (
    <Fragment>
      <div className="loading">
        <PulseLoader color="rgb(30, 241, 250)" />
      </div>
    </Fragment>
  );
};

export default Loading;
