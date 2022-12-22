module.exports = {
  proxy: () => {
    const PROXY = window.location.hostname === "localhost" ? "" : "http://3.37.71.53:4000/";
    return PROXY;
  },
};
