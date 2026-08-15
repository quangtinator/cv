import React from "react";
import { Navbar } from "../Navbar/Navbar";
import { ThemeContext } from "../../Context/theme";
import Image from "./../../assets/q_logo.svg";

import "./Header.css";
export const Header = () => {
  const [{ themeName }] = React.useContext(ThemeContext);

  return (
    <>
      <header className={"header center " + themeName}>
        <h3>
          <a href="#home" className="link">
            <span>
              <img src={Image} alt="logo" />
            </span>
          </a>
        </h3>
        <Navbar />
      </header>
    </>
  );
};
