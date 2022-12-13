module.exports = {
  tier: (tier, rank) => {
    return tier + " " + rank;
  },

  asc: (arr) => {
    arr.sort((a, b) => {
      a = a.gameData.gameStartTimestamp;
      b = b.gameData.gameStartTimestamp;
      if (a < b) return 1;
      if (a > b) return -1;

      return 0;
    });
  },

  kdaRate: (k, d, a) => {
    let kda = (k + a) / d;

    if (d === 0) {
      kda = 0;
    }

    return kda.toFixed(2);
  },

  winRate: (win, lose) => {
    return Math.round((win / (win + lose)) * 100);
  },

  timeNow: () => {
    const now = new Date();
    const y = now.getFullYear();
    const mo = now.getMonth();
    const d = now.getDate();
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();

    const data = {
      year: y,
      month: mo,
      day: d,
      hour: h,
      minute: m,
      second: s,
    };

    return data;
  },

  timeCalc: (duration) => {
    const h = parseInt(duration / 3600);
    const m = parseInt((duration % 3600) / 60);
    const s = duration % 60;

    const data = {
      hour: h,
      min: m,
      sec: s,
    };

    return data;
  },

  unixTimeCalc: (time) => {
    const date = new Date(time * 1000);
    const y = date.getFullYear();
    const mo = date.getMonth() + 1;
    const d = date.getDate();
    const h = date.getHours();
    const m = date.getMinutes();
    const s = date.getSeconds();

    const data = {
      year: y,
      month: mo,
      day: d,
      hour: h,
      minute: m,
      second: s,
    };

    return data;
  },

  passedTimeFromNow: (passed) => {
    const date = new Date();
    const now = Math.trunc(date.getTime() / 1000);
    const gap = Math.trunc(now - passed);

    const seconds = 1;
    const minute = seconds * 60;
    const hour = minute * 60;
    const day = hour * 24;
    const month = day * 30;
    const year = month * 12;

    let elapsedText = "";

    if (gap < seconds) {
      elapsedText = "방금 전";
    } else if (gap < minute) {
      elapsedText = gap + "초 전";
    } else if (gap < hour) {
      elapsedText = Math.trunc(gap / minute) + "분 전";
    } else if (gap < day) {
      elapsedText = Math.trunc(gap / hour) + "시간 전";
    } else if (gap < month) {
      elapsedText = Math.trunc(gap / day) + "일 전";
    } else if (gap < year) {
      elapsedText = Math.trunc(gap / month) + "달 전";
    } else {
      elapsedText = Math.trunc(gap / year) + "년 전";
    }

    return elapsedText;
  },
};
