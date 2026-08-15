import React from "react";

import TextLoop from "../../lib/TextLoop";

const GREETINGS = ["Xin chào", "Hi", "Hallo"];

export const Greetings = () => {
  return (
    <>
      <TextLoop items={GREETINGS} />
    </>
  );
};
