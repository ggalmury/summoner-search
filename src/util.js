const axios = require("axios");

module.exports = {
  axiosToRiot: function (url, resolve) {
    const apiKey = process.env.APIKEY;
    axios
      .get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
          "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
          "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
          Origin: "https://developer.riotgames.com",
          "X-Riot-Token": apiKey,
        },
      })
      .then((response) => {
        resolve(true, response.data);
        // must be removed after test
        // console.log(response.data);
      })
      .catch((err) => {
        console.log(err);
        resolve(false, err);
      });
  },
  success: function (res, data) {
    let result = { success: true, data };
    res.json(result);
  },

  fail: function (res, data) {
    let result = { success: false, data };
    res.json(result);
  },
};
