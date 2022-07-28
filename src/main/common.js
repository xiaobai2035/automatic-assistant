let fs = require("fs");
let md5 = require("blueimp-md5");
let { globalShortcut } = require("electron");
let path = require("path");

function random(a, b) {
  return Math.floor(Math.random() * b) + a;
}
function randomStr() {
  let g =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  for (let i = 0; i < 10; i++) {
    g.sort(() => {
      return Math.random() - 0.5;
    });
  }
  return g.join("").substring(0, 20);
}
function readMusic(val) {
  let arrFiles = [];
  const files = fs.readdirSync(val);
  for (let i = 0; i < files.length; i++) {
    const item = files[i];

    const stat = fs.lstatSync(val + "\\" + item);
    if (stat.isDirectory() === true) {
      arrFiles = arrFiles.concat(readMusic(val + "\\" + item));
    } else {
      var reg = /^.*\.mp3$/;
      if (reg.test(item)) {
        arrFiles.push(val + "\\" + item);
      }
    }
  }
  return arrFiles;
}

function checkwords(arg) {
  arg.checkReg = eval(arg.checkReg);
  arg.extandReg = eval(arg.extandReg);

  let targetFiles = [];
  let checkWordResult = {
    extentionNames: [],
    changeToSpaceExtension: [],
    files: [],
    folders: [],
    excludeExtensionFiles: [],
    checkResultArr: [],
    err: [],
  };

  function readDir(val) {
    const files = fs.readdirSync(val);
    for (let i = 0; i < files.length; i++) {
      const item = files[i];

      let pathName = val + "\\" + item;
      const stat = fs.lstatSync(pathName);
      if (stat.isDirectory() === true) {
        checkWordResult.folders.push(pathName);
        if (!arg.excludeDir.includes(item)) {
          readDir(pathName);
        }
      } else {
        let extentionName = path.extname(pathName);
        if (extentionName == "") {
          checkWordResult.changeToSpaceExtension.push(pathName);
        }
        if (
          !checkWordResult.extentionNames.includes(extentionName) &&
          extentionName != ""
        ) {
          checkWordResult.extentionNames.push(extentionName);
        }
        checkWordResult.files.push(pathName);
        if (arg.extandReg.test(item)) {
          checkWordResult.excludeExtensionFiles.push(pathName);
        } else {
          targetFiles.push(pathName);
        }
      }
    }
  }

  try {
    readDir(arg.targetPath);

    if (arg.isSearchWord) {
      targetFiles.forEach((item) => {
        var fileContent = fs.readFileSync(item).toString();

        if (arg.checkReg.test(fileContent)) {
          let singleObj = {};
          singleObj.path = item;
          singleObj.paragraphArr = [];
          let fileContentArr = fileContent.split("\n");
          fileContentArr.forEach((ele, index) => {
            if (arg.checkReg.test(ele)) {
              if (fileContentArr[index].length > 200) {
                let matchIndex = fileContentArr[index].match(
                  arg.checkReg
                ).index;
                fileContentArr[index] =
                  "......    " +
                  fileContentArr[index].substring(
                    matchIndex - 20,
                    matchIndex + 20
                  ) +
                  "    ......";
              }

              singleObj.paragraphArr.push(
                index + "    " + fileContentArr[index]
              );
            }
          });
          checkWordResult.checkResultArr.push(singleObj);
        }
      });
    }
  } catch (e) {
    console.log(e);
    checkWordResult.err.push(e.toString());
  }
  return checkWordResult;
}

function changeZoom(obj, { SetZoom1, SetZoomIn, SetZoomOut }) {
  let handler = () => {
    globalShortcut.register(SetZoom1, function () {
      if (obj && obj.webContents) {
        obj.level = 0;
        obj.webContents.setZoomLevel(obj.level);
      }
    });

    globalShortcut.register(SetZoomIn, function () {
      if (obj && obj.webContents) {
        obj.level = obj.level >= 3 ? obj.level : (obj.level += 0.2);
        obj.webContents.setZoomLevel(obj.level);
      }
    });

    globalShortcut.register(SetZoomOut, function () {
      if (obj && obj.webContents) {
        obj.level = obj.level <= -3 ? obj.level : (obj.level -= 0.2);
        obj.webContents.setZoomLevel(obj.level);
      }
    });
  };

  obj.on("focus", handler);

  obj.on("blur", () => {
    globalShortcut.unregister(SetZoomIn);
    globalShortcut.unregister(SetZoomOut);
    globalShortcut.unregister(SetZoom1);
  });
}

function openFind(obj) {
  obj.on("focus", () => {
    globalShortcut.register("CommandOrControl+F", function () {
      if (obj && obj.webContents) {
        obj.webContents.send("on-find", "");
      }
    });
  });
  obj.on("blur", () => {
    globalShortcut.unregister("CommandOrControl+F");
  });
}

function setTop(obj, { SetTop }) {
  obj.on("focus", () => {
    globalShortcut.register(SetTop, function () {
      if (obj.isTop) {
        obj.setAlwaysOnTop(false);
        obj.isTop = false;
      } else {
        obj.setAlwaysOnTop(true);
        obj.isTop = true;
      }
    });
  });
  obj.on("blur", () => {
    globalShortcut.unregister(SetTop);
  });
}

function openSubDev(obj) {
  obj.on("focus", () => {
    globalShortcut.register("ctrl+shift+i", function () {
      obj.openDevTools();
    });
  });
  obj.on("blur", () => {
    globalShortcut.unregister("ctrl+shift+i");
  });
}

function MD5(str) {
  return md5(md5(md5(str)));
}

function strToBinary(str) {
  var even = [0, 2, 4, 6, 8];
  var odd = [1, 3, 5, 7, 9];
  var result = [];
  var list = str.split("");
  for (var i = 0; i < list.length; i++) {
    if (i != 0) {
      result.push(" ");
    }
    var item = list[i];
    var binaryStr = item.charCodeAt().toString(2).split("");
    for (let j = 0; j < binaryStr.length; j++) {
      if (binaryStr[j] == "0") {
        binaryStr[j] = even[random(0, 5)];
      } else {
        binaryStr[j] = odd[random(0, 5)];
      }
    }

    result.push(binaryStr.join(""));
  }
  return result.join("");
}

function binaryToStr(str) {
  var result = [];

  var list = str.split(" ");
  for (var i = 0; i < list.length; i++) {
    var item = list[i].split("");
    for (let j = 0; j < item.length; j++) {
      if (item[j] % 2 == 0) {
        item[j] = "0";
      } else {
        item[j] = "1";
      }
    }

    var asciiCode = parseInt(item.join(""), 2);

    var charValue = String.fromCharCode(asciiCode);

    result.push(charValue);
  }

  return result.join("");
}

let templateInfo = {
  persenalSettings: {
    appAutoQuit: {
      isOpen: false,
      quitAppTime: "08:00:00 20:00:00",
    },
    isNotifyPerHour: false,
    isShowMenu: true,
    systemShortcut: {
      AppQuit: "ctrl+shift+alt+w",
      GetClipboardToNotes: "f8",
      HideShow: "alt+q",
      SetTop: "ctrl+alt+9",
      SetZoom1: "ctrl+alt+0",
      SetZoomIn: "ctrl+alt+Up",
      SetZoomOut: "ctrl+alt+Down",
    },
    clockRing: "",
    imgUrl: "",
    maskOpacity: 70,
  },
  download: {
    notes: [],
  },
  data: {
    accounting: [],
    behavior: [],
    copyWords: [],
    log: [],
    record: [
      {
        content:
          "Life was like a box of chocolates. You never know what you're going to get.",
        id: 1652603587483,
        name: "",
        su: "oneWord",
      },
      {
        content: "Just One Last Dance\nThat girl",
        id: 1652676131229,
        name: "sad song",
        su: "book",
      },
      {
        content: "My heart will go on",
        id: 1652676221741,
        name: "silence song",
        su: "book",
      },
      {
        content: "My songs know what you did in the dark\nradioactive",
        id: 1652176221741,
        name: "exciting song",
        su: "book",
      },
    ],
    shortcut: [
      {
        content: "https://www.google.com/&&0&&0&&0&&0",
        id: 1651988816098,
        js: "",
        name: "google",
        shortcut: "alt+0",
        su: "url",
      },
      {
        content: "/index",
        id: 1652115051954,
        name: "index",
        shortcut: "alt+1",
        su: "route",
      },
      {
        content: "/copy",
        id: 1652115051914,
        name: "copy",
        shortcut: "alt+2",
        su: "route",
      },
      {
        content: "/not",
        id: 1652125051954,
        name: "Note",
        shortcut: "alt+3",
        su: "route",
      },

      {
        content: "/search",
        id: 1652497075061,
        name: "search",
        shortcut: "alt+4",
        su: "route",
      },
    ],
    subjects: {
      behavior: ["anger", "curse", "fantasize", "compare", "complain"],
      expenses: [
        "snack",
        "drink",
        "stapleFood ",
        "phoneFee",
        "clothes",
        "livingGoods",
      ],
      income: ["salary", "investment", "bonus"],
      notes: [
        "default",
        "html",
        "js",
        "node",
        "vue",
        "electron",
        "python",
        "web",
      ],
      record: [
        "whatever",
        "diary",
        "mood",
        "ideas",
        "book",
        "image",
        "oneWord",
      ],
      shortcut: ["file", "url", "cmd", "extraJs", "copy", "route"],
    },
    todo: [],
  },
  theme: {
    version: 0,
    img: {
      key: "",
      key1: "",
      versionMain: "acf7ef943fdeb3cbfed8dd0d8f584731",
      versionSub: "acf7ef943fdeb3cbfed8dd0d8f584731",
    },
  },
};

let fn = (function () {
  var aa = function (str, key) {
    var len = key.length;
    var a = key.split("");
    var s = "",
      b,
      b1,
      b2,
      b3;
    for (var i = 0; i < str.length; i++) {
      b = str.charCodeAt(i);
      b1 = b % len;
      b = (b - b1) / len;
      b2 = b % len;
      b3 = (b - b2) / len;
      s += a[b3] + a[b2] + a[b1];
    }
    return s;
  };
  var bb = function (str, key) {
    var len = key.length;
    var b,
      b1,
      b2,
      b3,
      d = 0,
      s;
    s = new Array(Math.floor(str.length / 3));
    b = s.length;
    for (var i = 0; i < b; i++) {
      b1 = key.indexOf(str.charAt(d));
      d++;
      b2 = key.indexOf(str.charAt(d));
      d++;
      b3 = key.indexOf(str.charAt(d));
      d++;
      s[i] = b1 * len * len + b2 * len + b3;
    }
    b = eval("String.fromCharCode(" + s.join(",") + ")");
    return b;
  };
  function cc(str, direction, key, key1) {
    let res = "";
    let arr = str.split("");
    let str2 = key1.split("").sort().join("");
    let a, b;
    if (direction == 1) {
      a = key1;
      b = str2;
    } else {
      a = str2;
      b = key1;
    }
    arr.forEach((item, index) => {
      if (a.indexOf(item) > -1) {
        arr[index] = b[a.indexOf(item)];
      } else {
        if (direction == 1) {
          let r = aa(item, key);
          if (r.length == 3) {
            arr[index] = "<-" + r + "->";
          } else {
            arr[index] = item;
          }
        }
      }
    });
    res = arr.join("");
    return res;
  }
  function dd(str, key, key1) {
    if (key == "" || key1 == "") {
      return str;
    }
    return cc(str, 1, key, key1);
  }
  function ee(str, key, key1) {
    if (key == "" || key1 == "") {
      return str;
    }
    var r = /<-[\s\S]{3}->/g;
    var arr = str.match(r);
    if (arr) {
      for (let i = 0; i < arr.length; i++) {
        str = str.replace(arr[i], bb(arr[i].substring(2, 5), key));
      }
    }
    return cc(str, 0, key, key1);
  }
  function ff(e) {
    var g = e.split("");
    for (let i = 0; i < 10; i++) {
      g.sort(() => {
        return Math.random() - 0.5;
      });
    }
    return g.join("");
  }
  return function fn(a, b, c, d) {
    if (b == "change") {
      return dd(a, c, d);
    } else if (b == "get") {
      return ee(a, c, d);
    } else if (b == "key") {
      return ff("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    } else {
      return ff(
        " !#$%&()*+,-./123456789:;<=>@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]abcdefghijklmnopqrstuvwxyz{}~—‘’“”…。《》【】！（），：；"
      );
    }
  };
})();

function iconvDecode(str = "") {
  const iconv = require("iconv-lite");
  const encoding = "cp936";
  const binaryEncoding = "binary";
  return iconv.decode(Buffer.from(str, binaryEncoding), encoding);
}

function analyzeUrl(str) {
  let arr = str.split("&&");
  if (arr[1] != undefined) {
    arr[1] = arr[1] * 1;
  } else {
    arr[1] = null;
  }
  if (arr[2] != undefined) {
    arr[2] = arr[2] * 1;
  } else {
    arr[2] = null;
  }
  if (arr[3] != undefined) {
    if (arr[3] == "null") {
      arr[3] = null;
    } else {
      arr[3] = arr[3] * 1;
    }
  } else {
    arr[3] = null;
  }

  if (arr[4] != undefined) {
    if (arr[4] == "null") {
      arr[4] = null;
    } else {
      arr[4] = arr[4] * 1;
    }
  } else {
    arr[4] = null;
  }

  if (arr[5] != undefined) {
    if (arr[5] == "true") {
      arr[5] = true;
    } else {
      arr[5] = false;
    }
  } else {
    arr[5] = true;
  }

  return arr;
}

module.exports = {
  iconvDecode,
  changeZoom,
  strToBinary,
  binaryToStr,
  MD5,
  openFind,
  setTop,
  readMusic,
  templateInfo,
  checkwords,
  analyzeUrl,
  randomStr,
  openSubDev,
  fn,
};
