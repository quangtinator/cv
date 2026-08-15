import React from "react";
import "./Footer.css";
import { ThemeContext } from "../../Context/theme";

export const Footer = () => {
  const [{ themeName }] = React.useContext(ThemeContext);

  return (
    <>
      <div className={"section " + themeName}>
        <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" rel="noreferrer" target="_blank">
          <div className="footerBox">
            <h3 className="footer">
              Powered by 👌
            </h3>
          </div>
        </a>
      </div>
    </>
  );
};
