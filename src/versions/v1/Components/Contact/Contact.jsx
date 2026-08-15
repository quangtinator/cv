import React from "react";
import "./Contact.css";
import { CgMail } from "react-icons/cg";
import { ThemeContext } from "../../Context/theme";
import { FaLinkedin, FaGithub } from "react-icons/fa";

export const Contact = () => {
  const [{ themeName }] = React.useContext(ThemeContext);

  return (
    <>
      <div className="section">
        <h2 className="section__title" data-aos="fade-right">
          <span className="different">Contact 🤙</span>
        </h2>
        <div className="contactMain">
          <div
            className={"contactcontainer " + themeName}
            data-aos="fade-right"
          >
            <a
              href="https://www.linkedin.com/in/vu-nhat-quang-phung-77144b162/"
              target="_blank"
              rel="noreferrer"
            >
              <FaLinkedin className="linkedin" />
            </a>

            <a
              href="mailto:quang.phung@rwth-aachen.de"
              target="_blank"
              rel="noreferrer"
            >
              <CgMail className="email" />
            </a>

            <a
              href="https://github.com/quangtinator"
              target="_blank"
              rel="noreferrer"
            >
              <FaGithub className="github" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
};
