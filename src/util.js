const axios = require("axios");

module.exports = {
  apiUrl: function (url, user) {
    const apiKey = process.env.APIKEY;
    const fullUrl = `${url}${user}?api_key=${apiKey}`;
    return fullUrl;
  },

  axiosToRiot: function (url, resolve) {
    const apiKey = process.env.APIKEY;
    axios
      .get(url, { headers: { "X-Riot-Token": apiKey } })
      .then((response) => {
        resolve(true, response.data);
        // must be removed after test
        console.log(response.data);
      })
      .catch((err) => {
        console.log(err);
        resolve(false, err);
      });
  },
};
