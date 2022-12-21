module.exports = {
  proxy: () => {
    const PROXY = window.location.hostname === "localhost" ? "" : "/proxy";
    return PROXY;
  },
};
