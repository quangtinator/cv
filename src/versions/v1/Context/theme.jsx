import React from "react";

const ThemeContext = React.createContext();

const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = React.useState("dark");
  const toggleTheme = () => {
    themeName === "light" ? setThemeName("dark") : setThemeName("light");
  };

  return (
    <ThemeContext.Provider value={[{ themeName, toggleTheme }]}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeProvider, ThemeContext };
