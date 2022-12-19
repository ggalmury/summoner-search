module.exports = {
  ddragonVersion: () => {
    return "12.23.1";
  },

  profileIconImg: (code, version) => {
    return `http://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${code}.png`;
  },

  champImg: (name) => {
    if (name === null) {
      return `${process.env.PUBLIC_URL}/images/question_mark.jpeg`;
    }

    return `http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${name}_0.jpg`;
  },

  champSquareImg: (name, version) => {
    if (name === undefined) {
      return undefined;
    }

    return `http://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${name}.png`;
  },

  itemIng: (itemId) => {
    if (itemId === 0) {
      return `https://raw.communitydragon.org/12.22/game/data/spells/icons2d/linetip_blank.png`;
    }

    return `https://ddragon.bangingheads.net/cdn/latest/img/item/${itemId}.png`;
  },

  rankEmblem1: (tier) => {
    return `${process.env.PUBLIC_URL}/images/rank_emblems1/Emblem_${tier}.png`;
  },

  rankEmblem2: (tier) => {
    return `${process.env.PUBLIC_URL}/images/rank_emblems2/${tier}.png`;
  },

  mainPerkImg: (id) => {
    let perkName1 = "";
    let perkName2 = "";
    let perkStyle = "";

    switch (id) {
      case 8005:
        perkName1 = "PressTheAttack";
        perkName2 = "PressTheAttack";
        perkStyle = "Precision";
        break;
      case 8008:
        perkName1 = "LethalTempo";
        perkName2 = "LethalTempoTemp";
        perkStyle = "Precision";
        break;
      case 8010:
        perkName1 = "Conqueror";
        perkName2 = "Conqueror";
        perkStyle = "Precision";
        break;
      case 8021:
        perkName1 = "FleetFootwork";
        perkName2 = "FleetFootwork";
        perkStyle = "Precision";
        break;
      case 8112:
        perkName1 = "Electrocute";
        perkName2 = "Electrocute";
        perkStyle = "Domination";
        break;
      case 8124:
        perkName1 = "Predator";
        perkName2 = "Predator";
        perkStyle = "Domination";
        break;
      case 8128:
        perkName1 = "DarkHarvest";
        perkName2 = "DarkHarvest";
        perkStyle = "Domination";
        break;
      case 9923:
        perkName1 = "HailOfBlades";
        perkName2 = "HailOfBlades";
        perkStyle = "Domination";
        break;
      case 8214:
        perkName1 = "SummonAery";
        perkName2 = "SummonAery";
        perkStyle = "Sorcery";
        break;
      case 8229:
        perkName1 = "ArcaneComet";
        perkName2 = "ArcaneComet";
        perkStyle = "Sorcery";
        break;
      case 8230:
        perkName1 = "PhaseRush";
        perkName2 = "PhaseRush";
        perkStyle = "Sorcery";
        break;
      case 8351:
        perkName1 = "GlacialAugment";
        perkName2 = "GlacialAugment";
        perkStyle = "Inspiration";
        break;
      case 8360:
        perkName1 = "UnsealedSpellbook";
        perkName2 = "UnsealedSpellbook";
        perkStyle = "Inspiration";
        break;
      case 8369:
        perkName1 = "FirstStrike";
        perkName2 = "FirstStrike";
        perkStyle = "Inspiration";
        break;
      case 8437:
        perkName1 = "GraspOfTheUndying";
        perkName2 = "GraspOfTheUndying";
        perkStyle = "Resolve";
        break;
      case 8439:
        perkName1 = "VeteranAftershock";
        perkName2 = "VeteranAftershock";
        perkStyle = "Resolve";
        break;
      case 8465:
        perkName1 = "Guardian";
        perkName2 = "Guardian";
        perkStyle = "Resolve";
        break;
      default:
        return undefined;
    }

    let url = `https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/${perkStyle}/${perkName1}/${perkName2}.png`;

    return url;
  },

  subPerkImg: (id) => {
    let perkNum = 0;
    let perkStyle = "";

    switch (id) {
      case 8000:
        perkNum = 7201;
        perkStyle = "Precision";
        break;
      case 8100:
        perkNum = 7200;
        perkStyle = "Domination";
        break;
      case 8200:
        perkNum = 7202;
        perkStyle = "Sorcery";
        break;
      case 8300:
        perkNum = 7203;
        perkStyle = "Whimsy";
        break;
      case 8400:
        perkNum = 7204;
        perkStyle = "Resolve";
        break;
      default:
        return undefined;
    }

    let url = `https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/${perkNum}_${perkStyle}.png`;

    return url;
  },

  summonerSpellImg: (spellId) => {
    let spellName = "";

    switch (spellId) {
      case 1:
        spellName = "cleans";
        break;
      case 3:
        spellName = "exhaust";
        break;
      case 4:
        spellName = "flash";
        break;
      case 6:
        spellName = "ghost";
        break;
      case 7:
        spellName = "heal";
        break;
      case 11:
        spellName = "smite";
        break;
      case 12:
        spellName = "teleport";
        break;
      case 13:
        spellName = "clarity";
        break;
      case 14:
        spellName = "ignite";
        break;
      case 21:
        spellName = "barrier";
        break;
      case 32:
        spellName = "mark";
        break;
      default:
        return undefined;
    }

    let url = `${process.env.PUBLIC_URL}/images/summoner_spells/summoner_${spellName}.png`;

    return url;
  },

  gameType: (gameId) => {
    let game = "";

    switch (gameId) {
      case 0:
        game = "사용자 설정 게임";
        break;
      case 420:
        game = "개인/2인 랭크 게임";
        break;
      case 430:
        game = "일반 게임";
        break;
      case 440:
        game = "자유 랭크 게임";
        break;
      case 450:
        game = "무작위 총력전";
        break;
      default:
        game = undefined;
        break;
    }

    return game;
  },

  mapType: (mapId) => {
    let map = "";

    switch (mapId) {
      case 11:
        map = "소환사의 협곡";
        break;
      case 12:
        map = "칼바람 나락";
        break;
      default:
        map = undefined;
        break;
    }

    return map;
  },

  champNumToName: (id) => {
    let champion = "";

    switch (id) {
      case 1:
        champion = "Annie";
        break;
      case 2:
        champion = "Olaf";
        break;
      case 3:
        champion = "Galio";
        break;
      case 4:
        champion = "TwistedFate";
        break;
      case 5:
        champion = "XinZhao";
        break;
      case 6:
        champion = "Urgot";
        break;
      case 7:
        champion = "Leblanc";
        break;
      case 8:
        champion = "Vladimir";
        break;
      case 9:
        champion = "Fiddlesticks";
        break;
      case 10:
        champion = "Kayle";
        break;
      case 11:
        champion = "MasterYi";
        break;
      case 12:
        champion = "Alistar";
        break;
      case 13:
        champion = "Ryze";
        break;
      case 14:
        champion = "Sion";
        break;
      case 15:
        champion = "Sivir";
        break;
      case 16:
        champion = "Soraka";
        break;
      case 17:
        champion = "Teemo";
        break;
      case 18:
        champion = "Tristana";
        break;
      case 19:
        champion = "Warwick";
        break;
      case 20:
        champion = "Nunu";
        break;
      case 21:
        champion = "MissFortune";
        break;
      case 22:
        champion = "Ashe";
        break;
      case 23:
        champion = "Tryndamere";
        break;
      case 24:
        champion = "Jax";
        break;
      case 25:
        champion = "Morgana";
        break;
      case 26:
        champion = "Zilean";
        break;
      case 27:
        champion = "Singed";
        break;
      case 28:
        champion = "Evelynn";
        break;
      case 29:
        champion = "Twitch";
        break;
      case 30:
        champion = "Karthus";
        break;
      case 31:
        champion = "Chogath";
        break;
      case 32:
        champion = "Amumu";
        break;
      case 33:
        champion = "Rammus";
        break;
      case 34:
        champion = "Anivia";
        break;
      case 35:
        champion = "Shaco";
        break;
      case 36:
        champion = "DrMundo";
        break;
      case 37:
        champion = "Sona";
        break;
      case 38:
        champion = "Kassadin";
        break;
      case 39:
        champion = "Irelia";
        break;
      case 40:
        champion = "Janna";
        break;
      case 41:
        champion = "Gangplank";
        break;
      case 42:
        champion = "Corki";
        break;
      case 43:
        champion = "Karma";
        break;
      case 44:
        champion = "Taric";
        break;
      case 45:
        champion = "Veigar";
        break;
      case 48:
        champion = "Trundle";
        break;
      case 50:
        champion = "Swain";
        break;
      case 51:
        champion = "Caitlyn";
        break;
      case 53:
        champion = "Blitzcrank";
        break;
      case 54:
        champion = "Malphite";
        break;
      case 55:
        champion = "Katarina";
        break;
      case 56:
        champion = "Nocturne";
        break;
      case 57:
        champion = "Maokai";
        break;
      case 58:
        champion = "Renekton";
        break;
      case 59:
        champion = "JarvanIV";
        break;
      case 60:
        champion = "Elise";
        break;
      case 61:
        champion = "Orianna";
        break;
      case 62:
        champion = "MonkeyKing";
        break;
      case 63:
        champion = "Brand";
        break;
      case 64:
        champion = "LeeSin";
        break;
      case 67:
        champion = "Vayne";
        break;
      case 68:
        champion = "Rumble";
        break;
      case 69:
        champion = "Cassiopeia";
        break;
      case 72:
        champion = "Skarner";
        break;
      case 74:
        champion = "Heimerdinger";
        break;
      case 75:
        champion = "Nasus";
        break;
      case 76:
        champion = "Nidalee";
        break;
      case 77:
        champion = "Udyr";
        break;
      case 78:
        champion = "Poppy";
        break;
      case 79:
        champion = "Gragas";
        break;
      case 80:
        champion = "Pantheon";
        break;
      case 81:
        champion = "Ezreal";
        break;
      case 82:
        champion = "Mordekaiser";
        break;
      case 83:
        champion = "Yorick";
        break;
      case 84:
        champion = "Akali";
        break;
      case 85:
        champion = "Kennen";
        break;
      case 86:
        champion = "Garen";
        break;
      case 89:
        champion = "Leona";
        break;
      case 90:
        champion = "Malzahar";
        break;
      case 91:
        champion = "Talon";
        break;
      case 92:
        champion = "Riven";
        break;
      case 96:
        champion = "KogMaw";
        break;
      case 98:
        champion = "Shen";
        break;
      case 99:
        champion = "Lux";
        break;
      case 101:
        champion = "Xerath";
        break;
      case 102:
        champion = "Shyvana";
        break;
      case 103:
        champion = "Ahri";
        break;
      case 104:
        champion = "Graves";
        break;
      case 105:
        champion = "Fizz";
        break;
      case 106:
        champion = "Volibear";
        break;
      case 107:
        champion = "Rengar";
        break;
      case 110:
        champion = "Varus";
        break;
      case 111:
        champion = "Nautilus";
        break;
      case 112:
        champion = "Viktor";
        break;
      case 113:
        champion = "Sejuani";
        break;
      case 114:
        champion = "Fiora";
        break;
      case 115:
        champion = "Ziggs";
        break;
      case 117:
        champion = "Lulu";
        break;
      case 119:
        champion = "Draven";
        break;
      case 120:
        champion = "Hecarim";
        break;
      case 121:
        champion = "Khazix";
        break;
      case 122:
        champion = "Darius";
        break;
      case 126:
        champion = "Jayce";
        break;
      case 127:
        champion = "Lissandra";
        break;
      case 131:
        champion = "Diana";
        break;
      case 133:
        champion = "Quinn";
        break;
      case 134:
        champion = "Syndra";
        break;
      case 136:
        champion = "AurelionSol";
        break;
      case 141:
        champion = "Kayn";
        break;
      case 142:
        champion = "Zoe";
        break;
      case 143:
        champion = "Zyra";
        break;
      case 145:
        champion = "Kaisa";
        break;
      case 147:
        champion = "Seraphine";
        break;
      case 150:
        champion = "Gnar";
        break;
      case 154:
        champion = "Zac";
        break;
      case 157:
        champion = "Yasuo";
        break;
      case 161:
        champion = "Velkoz";
        break;
      case 163:
        champion = "Taliyah";
        break;
      case 164:
        champion = "Camille";
        break;
      case 166:
        champion = "Akshan";
        break;
      case 200:
        champion = "Belveth";
        break;
      case 201:
        champion = "Braum";
        break;
      case 202:
        champion = "Jhin";
        break;
      case 203:
        champion = "Kindred";
        break;
      case 221:
        champion = "Zeri";
        break;
      case 222:
        champion = "Jinx";
        break;
      case 223:
        champion = "TahmKench";
        break;
      case 234:
        champion = "Viego";
        break;
      case 235:
        champion = "Senna";
        break;
      case 236:
        champion = "Lucian";
        break;
      case 238:
        champion = "Zed";
        break;
      case 240:
        champion = "Kled";
        break;
      case 245:
        champion = "Ekko";
        break;
      case 246:
        champion = "Qiyana";
        break;
      case 254:
        champion = "Vi";
        break;
      case 266:
        champion = "Aatrox";
        break;
      case 267:
        champion = "Nami";
        break;
      case 268:
        champion = "Azir";
        break;
      case 350:
        champion = "Yuumi";
        break;
      case 360:
        champion = "Samira";
        break;
      case 412:
        champion = "Thresh";
        break;
      case 420:
        champion = "Illaoi";
        break;
      case 421:
        champion = "RekSai";
        break;
      case 427:
        champion = "Ivern";
        break;
      case 429:
        champion = "Kalista";
        break;
      case 432:
        champion = "Bard";
        break;
      case 497:
        champion = "Rakan";
        break;
      case 498:
        champion = "Xayah";
        break;
      case 516:
        champion = "Ornn";
        break;
      case 517:
        champion = "Sylas";
        break;
      case 518:
        champion = "Neeko";
        break;
      case 523:
        champion = "Aphelios";
        break;
      case 526:
        champion = "Rell";
        break;
      case 555:
        champion = "Pyke";
        break;
      case 711:
        champion = "Vex";
        break;
      case 777:
        champion = "Yone";
        break;
      case 875:
        champion = "Sett";
        break;
      case 876:
        champion = "Lillia";
        break;
      case 887:
        champion = "Gwen";
        break;
      case 888:
        champion = "Renata";
        break;
      case 895:
        champion = "Nilah";
        break;
      case 897:
        champion = "KSante";
        break;
      default:
        champion = undefined;
        break;
    }

    return champion;
  },
};
