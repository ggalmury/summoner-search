module.exports = {
  env: () => {
    const env = window.location.hostname === "localhost" ? "" : "http://3.37.71.53:4000";
    return env;
  },
};
