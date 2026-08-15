import React from "react";
import "./Techstacks.css";
import { FaReact, FaNodeJs, FaPython, FaDocker } from "react-icons/fa";
import {
  SiHtml5,
  SiExpress,
  SiPandas,
  SiNumpy,
  SiTensorflow,
  SiJira,
  SiTypescript
} from "react-icons/si";

import { DiCss3, DiMongodb } from "react-icons/di";
import { SiJavascript, SiGnubash } from "react-icons/si";
import { VscGithub, VscAzure } from "react-icons/vsc";
import { FaChartBar } from "react-icons/fa";

export const Techstacks = () => {
  return (
    <>
      <div className="section main" data-aos="fade-right">
        <h2 className="section__title different">Skills 🛠️</h2>
        <div className="techsection">
          <div>
            <SiHtml5 />
            <h5>HTML</h5>
          </div>

          <div>
            <DiCss3 />
            <h5>CSS</h5>
          </div>

          <div>
            <SiJavascript />
            <h5>Javascript</h5>
          </div>

          <div>
            <SiTypescript />
            <h5>Typescript</h5>
          </div>
          
          <div>
            <FaReact />
            <h5>React</h5>
          </div>

          <div>
            <FaNodeJs />
            <h5>Nodejs</h5>
          </div>

          <div>
            <DiMongodb />
            <h5>MongoDb</h5>
          </div>

          <div>
            <SiExpress />
            <h5>Express</h5>
          </div>

          <div>
            <FaDocker />
            <h5>Docker</h5>
          </div>

          <div>
            <VscAzure />
            <h5>Microsoft Azure</h5>
          </div>

          <div>
            <FaPython />
            <h5>Python</h5>
          </div>

          <div>
            <SiPandas />
            <h5>Pandas</h5>
          </div>

          <div>
            <SiNumpy />
            <h5>Numpy</h5>
          </div>

          <div>
            <SiTensorflow />
            <h5>Tensorflow</h5>
          </div>

          <div>
            <FaChartBar />
            <h5>Tableau</h5>
          </div>

          <div>
            <SiGnubash />
            <h5>Bash</h5>
          </div>

          <div>
            <VscGithub />
            <h5>Github</h5>
          </div>

          <div>
            <SiJira />
            <h5>Jira</h5>
          </div>
          
        </div>
      </div>
    </>
  );
};
