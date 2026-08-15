import { motion } from "framer-motion";
import { useState } from "react";
import VersionSwitcher from "../../shared/VersionSwitcher.jsx";
import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaMoon,
  FaSun,
  FaReact,
  FaPython,
  FaDocker,
  FaAws,
  FaNodeJs,
  FaGitAlt,
} from "react-icons/fa";
import {
  SiTypescript,
  SiPostgresql,
  SiGnubash,
  SiNextdotjs,
  SiMongodb,
} from "react-icons/si";
import { VscAzure } from "react-icons/vsc";

export default function Home() {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const skillsRow1 = [
    { icon: <FaReact size={40} />, name: "React" },
    { icon: <SiTypescript size={40} />, name: "TypeScript" },
    { icon: <FaPython size={40} />, name: "Python" },
    { icon: <FaDocker size={40} />, name: "Docker" },
    { icon: <VscAzure size={40} />, name: "Azure" },
    { icon: <FaAws size={40} />, name: "AWS" },
  ];

  const skillsRow2 = [
    { icon: <FaNodeJs size={40} />, name: "Node.js" },
    { icon: <SiNextdotjs size={40} />, name: "Next.js" },
    { icon: <SiPostgresql size={40} />, name: "PostgreSQL" },
    { icon: <SiMongodb size={40} />, name: "MongoDB" },
    { icon: <SiGnubash size={40} />, name: "Bash" },
    { icon: <FaGitAlt size={40} />, name: "Git" },
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6">
      <motion.header
        className="sticky top-0 z-50 neo-card mx-auto max-w-7xl p-3 sm:p-4 mb-6 sm:mb-8"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-extrabold">QP.</h1>

          <nav className="flex flex-wrap gap-3 sm:gap-4 items-center justify-center">
            <a
              href="#about"
              className="font-bold hover:text-[var(--primary)] transition-colors text-sm sm:text-base"
            >
              About
            </a>
            <a
              href="#skills"
              className="font-bold hover:text-[var(--primary)] transition-colors text-sm sm:text-base"
            >
              Skills
            </a>
            <a
              href="#experience"
              className="font-bold hover:text-[var(--primary)] transition-colors text-sm sm:text-base"
            >
              Experience
            </a>
            <a
              href="#projects"
              className="font-bold hover:text-[var(--primary)] transition-colors text-sm sm:text-base"
            >
              Projects
            </a>
            <a
              href="#contact"
              className="font-bold hover:text-[var(--primary)] transition-colors text-sm sm:text-base"
            >
              Contact
            </a>

            <motion.button
              onClick={toggleTheme}
              className="neo-btn p-2 sm:p-3"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle theme"
            >
              {theme === "light" ? <FaMoon size={18} /> : <FaSun size={18} />}
            </motion.button>
          </nav>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        {/* Hero Section */}
        <motion.section
          id="about"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="neo-card p-6 sm:p-8 md:p-12 text-center"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-4 sm:mb-6 leading-tight">
            Hi, I am <span className="text-[var(--primary)]">Quang Phung</span>
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-8">
            Software Engineer & DevOps Enthusiast
          </p>
          <p className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto mb-6 sm:mb-8 px-2">
            Experienced in full-stack development with Dockerized deployments
            and cloud infrastructure. Passionate about building scalable
            systems, CI/CD pipelines, and Infrastructure as Code.
          </p>

          <div className="flex flex-wrap gap-4 sm:gap-6 justify-center">
            <motion.a
              href="https://github.com/quangtinator"
              target="_blank"
              rel="noopener noreferrer"
              className="neo-btn flex items-center gap-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaGithub size={24} />
              <span className="hidden sm:inline">GitHub</span>
            </motion.a>
            <motion.a
              href="https://www.linkedin.com/in/vu-nhat-quang-phung-77144b162/"
              target="_blank"
              rel="noopener noreferrer"
              className="neo-btn bg-[var(--secondary)] flex items-center gap-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaLinkedin size={24} />
              <span className="hidden sm:inline">LinkedIn</span>
            </motion.a>
            <motion.a
              href="mailto:quang.phung@rwth-aachen.de"
              className="neo-btn bg-[var(--accent)] flex items-center gap-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaEnvelope size={24} />
              <span className="hidden sm:inline">Email</span>
            </motion.a>
          </div>
        </motion.section>

        {/* Skills Section */}
        <motion.section
          id="skills"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="neo-card p-6 sm:p-8 md:p-12 overflow-hidden"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 sm:mb-8 text-center">
            Tech <span className="text-[var(--primary)]">Stack</span>
          </h2>

          <div className="space-y-6">
            {/* First Row - Slides Right to Left */}
            <div className="relative overflow-hidden">
              <motion.div
                className="flex gap-8"
                animate={{
                  x: [0, -220 * skillsRow1.length],
                }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 25,
                    ease: "linear",
                  },
                }}
              >
                {[...skillsRow1, ...skillsRow1].map((skill, index) => (
                  <div
                    key={index}
                    className="neo-card p-6 sm:p-8 flex flex-col items-center justify-center gap-3 sm:gap-4 hover:bg-[var(--primary)] transition-colors min-w-[180px] sm:min-w-[200px]"
                  >
                    <div className="text-[var(--text)]">{skill.icon}</div>
                    <p className="font-bold text-sm sm:text-base text-center whitespace-nowrap">
                      {skill.name}
                    </p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Second Row - Slides Left to Right */}
            <div className="relative overflow-hidden">
              <motion.div
                className="flex gap-8"
                animate={{
                  x: [-220 * skillsRow2.length, 0],
                }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 25,
                    ease: "linear",
                  },
                }}
              >
                {[...skillsRow2, ...skillsRow2].map((skill, index) => (
                  <div
                    key={index}
                    className="neo-card p-6 sm:p-8 flex flex-col items-center justify-center gap-3 sm:gap-4 hover:bg-[var(--primary)] transition-colors min-w-[180px] sm:min-w-[200px]"
                  >
                    <div className="text-[var(--text)]">{skill.icon}</div>
                    <p className="font-bold text-sm sm:text-base text-center whitespace-nowrap">
                      {skill.name}
                    </p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Experience & Education */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8" id="experience">
          <motion.section
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="neo-card p-6 sm:p-8"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4 sm:mb-6">
              💼 <span className="text-[var(--secondary)]">Experience</span>
            </h2>
            <div className="space-y-4 sm:space-y-6">
              <div className="border-l-4 border-[var(--primary)] pl-3 sm:pl-4">
                <div className="neo-badge inline-block mb-2 text-xs sm:text-sm">
                  Aug 2023 - Present
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">
                  Software Engineer
                </h3>
                <p className="font-bold text-[var(--primary)] mb-2">
                  Fraunhofer FIT
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm sm:text-base opacity-90">
                  <li>Full-stack web development for research projects</li>
                  <li>Docker & VM-based cloud deployments</li>
                  <li>Improved delivery speed by ~30%</li>
                </ul>
              </div>
              <div className="border-l-4 border-[var(--secondary)] pl-3 sm:pl-4">
                <div className="neo-badge inline-block mb-2 text-xs sm:text-sm">
                  May 2022 - Dec 2022
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">
                  Data Engineering Working Student
                </h3>
                <p className="font-bold text-[var(--secondary)] mb-2">
                  Vygon GmbH
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm sm:text-base opacity-90">
                  <li>Automated data pipelines (-40% manual work)</li>
                  <li>SQL-driven validation & compliance docs</li>
                </ul>
              </div>
            </div>
          </motion.section>{" "}
          <motion.section
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="neo-card p-6 sm:p-8"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4 sm:mb-6">
              🎓 <span className="text-[var(--accent)]">Education</span>
            </h2>
            <div className="space-y-4 sm:space-y-6">
              <div className="border-l-4 border-[var(--primary)] pl-3 sm:pl-4">
                <div className="neo-badge inline-block mb-2 text-xs sm:text-sm">
                  Apr 2022 - Apr 2024
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">
                  M.Sc. Data Science
                </h3>
                <p className="font-bold text-[var(--primary)] mb-1">
                  RWTH Aachen University
                </p>
                <p className="text-sm sm:text-base opacity-90">
                  Dean's List 2023-2024
                </p>
              </div>
              <div className="border-l-4 border-[var(--secondary)] pl-3 sm:pl-4">
                <div className="neo-badge inline-block mb-2 text-xs sm:text-sm">
                  Apr 2018 - Dec 2021
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">
                  B.Sc. Computer Science
                </h3>
                <p className="font-bold text-[var(--secondary)]">
                  RWTH Aachen University
                </p>
              </div>
            </div>
          </motion.section>
        </div>

        {/* Projects Section */}
        <motion.section
          id="projects"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="neo-card p-6 sm:p-8 md:p-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 sm:mb-8 text-center">
            Featured <span className="text-[var(--primary)]">Projects</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <motion.a
              href="https://oer-cycle.elearn.rwth-aachen.de/"
              target="_blank"
              rel="noopener noreferrer"
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              className="neo-card p-4 sm:p-6 hover:shadow-[12px_12px_0px_var(--text)] cursor-pointer"
            >
              <div className="neo-badge inline-block mb-3 sm:mb-4">
                Bachelor Thesis
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold mb-2 sm:mb-3">
                OutdOER
              </h3>
              <p className="mb-3 sm:mb-4 text-sm sm:text-base opacity-90">
                A digital game for learning about Open Educational Resources. Interactive web application with certificate issuance. Published at CELDA 2022.
              </p>
              <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                <span className="px-2 sm:px-3 py-1 bg-[var(--secondary)] border-2 border-[var(--text)] text-xs sm:text-sm font-bold">
                  React
                </span>
                <span className="px-2 sm:px-3 py-1 bg-[var(--accent)] border-2 border-[var(--text)] text-xs sm:text-sm font-bold">
                  Node.js
                </span>
                <span className="px-2 sm:px-3 py-1 bg-[var(--success)] border-2 border-[var(--text)] text-xs sm:text-sm font-bold">
                  Docker
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-[var(--primary)]">🔗 View Live Demo →</p>
            </motion.a>

            <motion.a
              href="https://github.com/quangtinator/flashcard"
              target="_blank"
              rel="noopener noreferrer"
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              className="neo-card p-4 sm:p-6 hover:shadow-[12px_12px_0px_var(--text)] cursor-pointer"
            >
              <div className="neo-badge inline-block mb-3 sm:mb-4">
                Master Thesis
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold mb-2 sm:mb-3">
                Flashcard Widget
              </h3>
              <p className="mb-3 sm:mb-4 text-sm sm:text-base opacity-90">
                Interactive flashcard learning widget with spaced repetition algorithms for enhanced knowledge retention.
              </p>
              <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                <span className="px-2 sm:px-3 py-1 bg-[var(--primary)] border-2 border-[var(--text)] text-xs sm:text-sm font-bold">
                  TypeScript
                </span>
                <span className="px-2 sm:px-3 py-1 bg-[var(--secondary)] border-2 border-[var(--text)] text-xs sm:text-sm font-bold">
                  React
                </span>
                <span className="px-2 sm:px-3 py-1 bg-[var(--accent)] border-2 border-[var(--text)] text-xs sm:text-sm font-bold">
                  Vue
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-[var(--primary)]">🔗 View on GitHub →</p>
            </motion.a>

            <motion.a
              href="https://github.com/quangtinator/prime_mqtt"
              target="_blank"
              rel="noopener noreferrer"
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              className="neo-card p-4 sm:p-6 hover:shadow-[12px_12px_0px_var(--text)] cursor-pointer"
            >
              <div className="neo-badge inline-block mb-3 sm:mb-4">
                Demo Project
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold mb-2 sm:mb-3">
                Python MQTT Prime
              </h3>
              <p className="mb-3 sm:mb-4 text-sm sm:text-base opacity-90">
                A small demo project for Mosquitto MQTT. Real-time IoT data processing with efficient message queuing.
              </p>
              <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                <span className="px-2 sm:px-3 py-1 bg-[var(--primary)] border-2 border-[var(--text)] text-xs sm:text-sm font-bold">
                  Python
                </span>
                <span className="px-2 sm:px-3 py-1 bg-[var(--secondary)] border-2 border-[var(--text)] text-xs sm:text-sm font-bold">
                  MQTT
                </span>
                <span className="px-2 sm:px-3 py-1 bg-[var(--accent)] border-2 border-[var(--text)] text-xs sm:text-sm font-bold">
                  IoT
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-[var(--primary)]">🔗 View on GitHub →</p>
            </motion.a>
          </div>
        </motion.section>

        {/* Certifications Section */}
        <motion.section
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="neo-card p-6 sm:p-8 md:p-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 sm:mb-8 text-center">
            🏆 <span className="text-[var(--success)]">Certifications</span>
          </h2>
          <motion.div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
            <motion.div
              variants={fadeInUp}
              className="border-l-4 border-[var(--primary)] pl-4"
            >
              <p className="font-bold text-sm sm:text-base">
                AWS Cloud Practitioner Essentials
              </p>
              <p className="text-xs sm:text-sm opacity-80">
                AWS Training & Certification, 2025
              </p>
            </motion.div>
            <motion.div
              variants={fadeInUp}
              className="border-l-4 border-[var(--secondary)] pl-4"
            >
              <p className="font-bold text-sm sm:text-base">
                Certified Data Scientist Basic
              </p>
              <p className="text-xs sm:text-sm opacity-80">
                Fraunhofer IAIS, 2024
              </p>
            </motion.div>
            <motion.div
              variants={fadeInUp}
              className="border-l-4 border-[var(--accent)] pl-4"
            >
              <p className="font-bold text-sm sm:text-base">
                Back End Development and APIs
              </p>
              <p className="text-xs sm:text-sm opacity-80">
                freeCodeCamp, 2022
              </p>
            </motion.div>
            <motion.div
              variants={fadeInUp}
              className="border-l-4 border-[var(--success)] pl-4"
            >
              <p className="font-bold text-sm sm:text-base">
                JavaScript Algorithms & Data Structures
              </p>
              <p className="text-xs sm:text-sm opacity-80">
                freeCodeCamp, 2022
              </p>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Contact Section */}
        <motion.section
          id="contact"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="neo-card p-6 sm:p-8 md:p-12 text-center"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-8">
            Let us <span className="text-[var(--primary)]">Connect!</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            I am always open to new opportunities and collaborations. Feel free
            to reach out!
          </p>

          <motion.a
            href="mailto:quang.phung@rwth-aachen.de"
            className="neo-btn bg-[var(--primary)] inline-flex items-center gap-2 text-sm sm:text-base"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaEnvelope />
            Get In Touch
          </motion.a>
        </motion.section>
      </main>

      <footer className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12 text-center">
        <div className="neo-badge inline-block mb-4">
          <p className="font-bold text-sm sm:text-base">
            Made with 💙 by Quang Phung
          </p>
        </div>
        <p className="text-xs sm:text-sm opacity-70">
          Aachen, Germany • (+49) 176 4529 7897
        </p>
      </footer>

      <VersionSwitcher current="v2" />
    </div>
  );
}
