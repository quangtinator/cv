import React from "react";
import "./About.css";
import { Type } from "./Type";
import { Greetings } from "./Greetings";
import { MdDescription, MdEmail } from "react-icons/md";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { Introduction } from "./Introduction";
import { Timeline } from "./Timeline";
import { Techstacks } from "./Techstacks";
export const About = () => {
  return (
    <>
      <div className="about center">
        <h1 data-aos="fade-right" className="mobileHead">
          <Greetings />, I am <span className="about__name">Quang Phung</span>
        </h1>
        <Type />
        <p className="about__desc" data-aos="fade-right">
          Hard-working, ambitious and results-oriented professional in the making. Proficient in a wide range of technologies 
          and always willing to learn new ones.
        </p>
        <div className="about__contact"> 
          <a
            href="https://github.com/quangtinator"
            aria-label="github"
            className="link link--icon"
            target="_blank"
            rel="noreferrer"
          >
            <FaGithub size={35} />
          </a>
          <a
            href="https://drive.google.com/file/d/1ZGd4tEGiIrnX7-CFe_tCr9O9DW3-un_L/view?usp=drive_link"
            aria-label="resume"
            className="link link--icon"
            target="_blank"
            rel="noreferrer"
          >
            <MdDescription size={35} />
          </a>
          <a
            href="https://www.linkedin.com/in/vu-nhat-quang-phung-77144b162/"
            aria-label="linkedin"
            className="link link--icon"
            target="_blank"
            rel="noreferrer"
          >
            <FaLinkedin size={35} />
          </a>
          <a
            href="mailto:quang.phung@rwth-aachen.de"
            target="_blank"
            rel="noreferrer"
            aria-label="mail"
            className="link link--icon"
          >
            <MdEmail size={35} />
          </a>
        </div>
      </div>
      <Introduction />
      <section id="#timeline">
        <Timeline />
      </section>
      <section id="#skills">
        <Techstacks />
      </section>
    </>
  );
};
