const axios = require("axios");

module.exports = {
  riotRes: (url, resolve) => {
    axios
      .get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
          "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
          "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
          Origin: "https://developer.riotgames.com",
          "X-Riot-Token": process.env.APIKEY,
        },
      })
      .then((response) => {
        resolve(true, response.data);
        // must be removed after test
        // console.log(response.data);
      })
      .catch((err) => {
        console.log(err);
        alert("소환사 정보 요청 에러");
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
};
