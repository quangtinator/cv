import React from "react";

import Typewriter from "../../lib/Typewriter";

const ROLES = ["Full Stack Developer", "Data Scientist", "Data Engineer"];

export const Type = () => {
  return (
    <>
      <Typewriter strings={ROLES} deleteSpeed={100} loop />
    </>
  );
};
