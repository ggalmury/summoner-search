const axios = require("axios");

module.exports = {
  riotRes: (url, resolve) => {
    const headers = { "X-Riot-Token": process.env.APIKEY };
    let test;

    axios
      .get(url, { headers })
      .then((response) => {
        test = response;
        resolve(true, response.data);
        // must be removed after test
        // console.log(response.data);
      })
      .catch((err) => {
        console.log(err);
        resolve(false, err);
      });
  },
  success: (res, data) => {
    let result = { success: true, data };
    res.json(result);
  },

  fail: (res, data) => {
    let result = { success: false, data };
    res.json(result);
  },

  // snake_case -> camelCase 변환 함수
  chgCamelExpForList: (targetList) => {
    let retArr = [];

    targetList.forEach((targetObj) => {
      let retObj = new Object();

      for (let key in targetObj) {
        let name = key.toLowerCase().replace(/_[a-z]/g, (str) => {
          return str[1].toUpperCase();
        });
        retObj[name] = targetObj[key];
      }
      retArr.push(retObj);
    });
    return retArr;
  },

  toLowerRegexp: (str) => {
    return str?.toLowerCase()?.replace(/\s/gi, "");
  },
};
