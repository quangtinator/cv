import React from "react";
import { ThemeContext } from "../../Context/theme";
import "./Navbar.css";
import { MdBrightness2, MdWbSunny } from "react-icons/md";

export const Navbar = () => {
  const [{ themeName, toggleTheme }] = React.useContext(ThemeContext);
  const [showNavList, setShowNavList] = React.useState(false);

  const toggleNavList = (id) => {
    var element = document.getElementById(id);
    if (element) {
      element.scrollIntoView();
    }
    setShowNavList(!showNavList);
  };
  return (
    <>
      <nav className="center nav">
        <ul
          style={{ display: showNavList ? "flex" : null }}
          className="nav__list"
        >
          <li className="nav__list-item">
            <a
              href="#about"
              onClick={() => toggleNavList("#about")}
              className="link link--nav"
            >
              About
            </a>
          </li>
          <li className="nav__list-item">
            <a
              href="#timeline"
              onClick={() => toggleNavList("#timeline")}
              className="link link--nav"
            >
              Timeline
            </a>
          </li>
          <li className="nav__list-item">
            <a
              href="#skills"
              onClick={() => toggleNavList("#skills")}
              className="link link--nav"
            >
              Skills
            </a>
          </li>
          <li className="nav__list-item">
            <a
              href="#projects"
              onClick={() => toggleNavList("#projects")}
              className="link link--nav"
            >
              Projects
            </a>
          </li>
          <li className="nav__list-item">
            <a
              href="#contact"
              onClick={() => toggleNavList("#contact")}
              className="link link--nav"
            >
              Contact
            </a>
          </li>
          <li className="nav__list-item">
            <a
              href="https://drive.google.com/file/d/1ZGd4tEGiIrnX7-CFe_tCr9O9DW3-un_L/view?usp=drive_link"
              onClick={toggleNavList}
              className="link link--nav"
              target="_blank"
              rel="noreferrer"
            >
              Résumé
            </a>
          </li>
        </ul>
        <button
          type="button"
          onClick={toggleTheme}
          className="btn btn--icon nav__theme"
          aria-label="toggle theme"
          style={{ backgroundColor: "inherit" }}
        >
          {themeName === "dark" ? (
            <MdWbSunny size={24} />
          ) : (
            <MdBrightness2 size={24} />
          )}
        </button>
      </nav>
    </>
  );
};
