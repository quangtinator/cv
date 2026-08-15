import React from "react";
import "./Introduction.css";
import {
  MdRestaurant,
  MdSportsTennis,
  MdSportsEsports,
} from "react-icons/md";
import { ThemeContext } from "../../Context/theme";
import profilePic from "../../assets/ava.jpg";


export const Introduction = () => {
  const [{ themeName }] = React.useContext(ThemeContext);

  return (
    <>
      <section id="#about">
        <div className="section" data-aos="fade-right">
          <h2 className="section__title">
            <span className="different">About 🔎</span>
          </h2>
          <div className={"introduction " + themeName}>
            <div className="introduction_logocontainer">
              <img src={profilePic} alt="Images" />
            </div>
            <div className="introduction_datacontainer">
              <h4>
                My name is{" "}
                <span className="different">Quang Phung </span> and I am from{" "}
                <span className="different">
                  {" "}
                  Hanoi, Vietnam
                </span>
                . I have completed my bachelor degree in 
                <span className="different">
                  {" "}
                  Computer Science
                </span> at 
                <span className="different">
                  {" "}
                  RWTH Aachen University.
                </span>
                  During my university years, I have learnt a lot about coding through 
                  various courses and projects. I am currenty improving myself in order
                  to tackle bigger challenges in the field of 
                <span className="different">
                  {" "}
                  Information Technology.
                </span>
              </h4>
              <h4>Things to keep me sane :</h4>
              <h4 className="different">
                <span className="icons">
                  <MdSportsEsports size={24} />
                </span>
                Video Games 
              </h4>
              <h4 className="different">
                <span className="icons">
                  <MdSportsTennis size={24} />
                </span>
                Watching Sports
              </h4>
              <h4 className="different">
                <span className="icons">
                  <MdRestaurant size={24} />
                </span>
                Cooking
              </h4>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
