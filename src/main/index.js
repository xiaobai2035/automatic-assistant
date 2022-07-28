import { app, BrowserWindow, ipcMain, globalShortcut } from "electron";

import "../renderer/store";
import dayjs from "dayjs";

const { clipboard } = require("electron");
let fs = require("fs");
let path = require("path");
let { exec } = require("child_process");

let {
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
} = require("./common");

const winURL =
  process.env.NODE_ENV === "development"
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`;

let mainWindow;
let sonWindows = [];

let show = true;
let notAllowed = false;
let blurTimer = null;

let extraObj = {};

let toDoTimer = null;
let todoArr = [];
let needRemindArr = [];

let systemShortcut = {};
let theShortCut = [];

let notifyArr = [];
let isExcutingNotify = false;
let notifyWindow = null;
let notifyTimer = null;
let systemTimer = null;
let clockRing = "";
let isWantToQuit = false;

let notifyUrl = path.join(__dirname, "/static/notify.html");
let defaultRingSrc = path.join(__dirname, "/static/ring.mp3");

function newWindow(
  [address, width, height, x, y, frame],
  webPreferences,
  jsString
) {
  let sonWindow = sonWindows.find((value, index, arr) => {
    return value.windowName == address;
  });
  if (sonWindow) {
    if (!show) {
      sonWindow.show();
    }
    sonWindow.setAlwaysOnTop(true);
    sonWindow.setAlwaysOnTop(false);
    sonWindow.focus();
  } else {
    sonWindow = new BrowserWindow({
      icon: path.join(__dirname, "/static/icon.ico"),
      width: width || 1000,
      height: height || 563,
      frame,
      webPreferences,
    });

    if (address.match(/^http/)) {
      sonWindow.loadURL(address);
    } else if (address.match(/html$/)) {
      sonWindow.loadFile(address);
    }
    if (x != null && y != null) {
      sonWindow.setPosition(x, y);
    }
    sonWindow.level = 0;

    changeZoom(sonWindow, systemShortcut);
    setTop(sonWindow, systemShortcut);
    openSubDev(sonWindow);

    if (address != notifyUrl) {
      openFind(sonWindow);
    }

    if (jsString) {
      sonWindow.webContents.once("dom-ready", () => {
        sonWindow.webContents.executeJavaScript(jsString);
      });
    }

    sonWindow.on("close", () => {
      sonWindows = sonWindows.filter((item, index) => {
        return item.windowName != sonWindow.windowName;
      });
      sonWindow = null;
      globalShortcut.unregister("CommandOrControl+F");
      globalShortcut.unregister("ctrl+shift+i");
    });

    sonWindow.windowName = address;
    sonWindows.push(sonWindow);
  }
  return sonWindow;
}

function registerShortcut() {
  try {
    globalShortcut.unregisterAll();

    let HideShow = systemShortcut.HideShow;
    let AppQuit = systemShortcut.AppQuit;
    let GetClipboardToNotes = systemShortcut.GetClipboardToNotes;
    globalShortcut.register(HideShow, () => {
      if (show) {
        mainWindow.hide();
        notAllowed = true;
        for (let i = 0; i < sonWindows.length; i++) {
          sonWindows[i].hide();
        }
      } else {
        notAllowed = false;
        for (let i = 0; i < sonWindows.length; i++) {
          sonWindows[i].show();
        }
        mainWindow.show();
      }
      show = !show;
    });
    globalShortcut.register(AppQuit, () => {
      isWantToQuit = true;
      app.quit();
    });

    globalShortcut.register(GetClipboardToNotes, () => {
      if (notAllowed) return;

      let temp = {
        targetPath: "user/download/notes",
        obj: {
          content: getClipboard(),
          id: dayjs().valueOf(),
          name: "",
          su: "default",
        },
      };
      mainWindow.webContents.send("sendSingleData", temp);
    });

    theShortCut.forEach(function (item) {
      switch (item.su) {
        case "file":
          globalShortcut.register(item.shortcut, () => {
            if (notAllowed) return;
            newWindow(
              analyzeUrl(item.content),
              {
                nodeIntegration: true,
                enableRemoteModule: true,
                webviewTag: true,
              },
              item.js
            );
          });
          break;
        case "url":
          globalShortcut.register(item.shortcut, () => {
            if (notAllowed) return;
            newWindow(
              analyzeUrl(item.content),
              {
                nodeIntegration: false,
                enableRemoteModule: false,
                webviewTag: false,
              },
              item.js
            );
          });
          break;
        case "cmd":
          globalShortcut.register(item.shortcut, () => {
            if (notAllowed) return;
            if (item.content.includes("explorer")) {
              let content = item.content.replace("explorer ", "");
              require("child_process").spawnSync("start", [content], {
                shell: true,
              });
            } else {
              exec(
                item.content,
                { encoding: "binary" },
                (err, stdout, stderr) => {
                  if (stderr) {
                    let message = {
                      name: "CMD ERR",
                      content: iconvDecode(stderr),
                      id: dayjs().valueOf(),
                    };
                    let temp = {
                      targetPath: "user/data/log",
                      obj: message,
                    };
                    mainWindow.webContents.send("sendSingleData", temp);
                    excuteNotify(message);
                  }
                }
              );
            }
          });
          break;
        case "extraJs":
          globalShortcut.register(item.shortcut, () => {
            if (notAllowed) return;
            try {
              eval(item.content);
            } catch (e) {
              // console.log(e);
              let message = {
                name: "EXTRAJS ERR",
                content: e.toString(),
                id: dayjs().valueOf(),
              };

              let temp = {
                targetPath: "user/data/log",
                obj: message,
              };
              mainWindow.webContents.send("sendSingleData", temp);
              excuteNotify(message);
            }
          });
        case "copy":
          globalShortcut.register(item.shortcut, () => {
            if (notAllowed) return;
            clipboard.writeText(item.content);
          });
          break;
        case "route":
          globalShortcut.register(item.shortcut, () => {
            if (notAllowed) return;

            mainWindow.show();
            mainWindow.webContents.send("jumpToRoute", item.content);
          });
          break;
      }
    });
  } catch (e) {
    // console.log(e);
  }
}
function getClipboard() {
  let content = clipboard.readImage();
  let dataUrl = content.toDataURL();
  if (dataUrl == "data:image/png;base64,") {
    dataUrl = clipboard.readText();
  }
  excuteNotify({
    name: "Clipboard",
    content: dataUrl,
    id: dayjs().format("HH:mm"),
  });
  return dataUrl;
}
function excuteNotify(obj) {
  let closeTimeObj = {
    ExtraWindow: 10000,
    "TodoExcute ERR": 10000,
    "CMD ERR": 10000,
    "EXTRAJS ERR": 10000,
    "Rest Per Hour": 5000,
    Clipboard: 5000,
    Countdown: 10000,
    "Temp Clock": 60000,
  };
  let closeTime = closeTimeObj[obj.name];
  closeTime = closeTime == undefined ? 60000 : closeTime;
  if (isExcutingNotify) {
    notifyArr.push(obj);
    return;
  }
  isExcutingNotify = true;

  if (obj.name.toLocaleLowerCase().includes("clock")) {
    mainWindow.webContents.send("pauseMusic", {});
    obj.ring = clockRing;
  }

  notifyWindow = newWindow([notifyUrl, 300, 200, 0, 620, false], {
    nodeIntegration: true,
    enableRemoteModule: true,
    webviewTag: true,
  });

  setTimeout(() => {
    notifyWindow.webContents.send("excute-notify", obj);
  }, 500);
  notifyWindow.setAlwaysOnTop(true);
  notifyTimer = setTimeout(() => {
    closeNotifyWindowFn();
  }, closeTime);
}

function closeNotifyWindowFn() {
  notifyWindow.close();
  isExcutingNotify = false;
  if (notifyArr.length != 0) {
    excuteNotify(notifyArr.shift());
  }
}

function excuteTodo(clock) {
  if (clock) {
    needRemindArr.push(clock);
    needRemindArr.sort((a, b) => {
      return dayjs(a.time).valueOf() - dayjs(b.time).valueOf();
    });
    return;
  }
  todoArr.forEach((item) => {
    if (item.repeat) {
      let today = dayjs().format("YYYY-MM-DD");
      item.time = today + " " + item.time.split(" ")[1];
    }
  });
  needRemindArr = todoArr.filter((item) => {
    return item.remind && dayjs(item.time).valueOf() >= dayjs().valueOf();
  });

  needRemindArr.sort((a, b) => {
    return dayjs(a.time).valueOf() - dayjs(b.time).valueOf();
  });

  clearInterval(toDoTimer);
  toDoTimer = setInterval(() => {
    if (needRemindArr.length > 0) {
      let nowTime = dayjs().valueOf();
      let firstTodoTime = dayjs(needRemindArr[0].time).valueOf();
      if (nowTime >= firstTodoTime) {
        var temp = needRemindArr.shift();
        if (temp.excute) {
          try {
            eval(temp.excute);
          } catch (e) {
            let message = {
              name: "TodoExcute ERR",
              content: e.toString(),
              id: dayjs().valueOf(),
            };

            let temp = {
              targetPath: "user/data/log",
              obj: message,
            };
            mainWindow.webContents.send("sendSingleData", temp);
            excuteNotify(message);
          }
        }
        excuteNotify({
          name: temp.name,
          content: "Time is up",
          id: temp.time,
        });
      }
    }
  }, 1000);
}

(function () {
  let mainWindowId = randomStr();

  let dataPath = {
    configue: path.resolve(app.getPath("exe"), "../resources/configue.json"),
    memorandum: path.resolve(app.getPath("exe"), "../resources/memorandum.md"),
    notepad: path.resolve(app.getPath("exe"), "../resources/notepad.md"),
  };

  let info = {};
  let theme = {};
  let { fn } = require("./common");

  let theLoginTime = 0;

  let twoLevelLogin = {
    isTwoLevelLogin: false,
    route: "",
  };
  let loginAnswer = {};

  function createWindow() {
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
      icon: path.join(__dirname, "/static/icon.ico"),
      height: 563,
      useContentSize: true,
      width: 1000,
      frame: false,
      checkMainId: mainWindowId,
    });

    mainWindow.loadURL(winURL);

    openFind(mainWindow);
    mainWindow.level = 0;
    if (info.persenalSettings) {
      changeZoom(mainWindow, info.persenalSettings.systemShortcut);
      setTop(mainWindow, info.persenalSettings.systemShortcut);
    }

    mainWindow.on("close", (event) => {
      if (theLoginTime == 0 || isWantToQuit) {
        isWantToQuit = false;
      } else {
        mainWindow.show();
        mainWindow.webContents.send("wantToClose", {});
        event.preventDefault();
      }
    });
    mainWindow.on("closed", () => {
      mainWindow = null;
    });

    mainWindow.on("blur", () => {
      clearTimeout(blurTimer);
      blurTimer = setTimeout(() => {
        mainWindow.webContents.send("jumpToRoute", "/index");
      }, 180000);
    });

    mainWindow.on("focus", () => {
      clearTimeout(blurTimer);
    });
  }

  function readFile() {
    try {
      info = JSON.parse(fs.readFileSync(dataPath.configue).toString());
      info.theme.img = JSON.parse(binaryToStr(info.theme.img));
      theme = info.theme;
      info.data = JSON.parse(
        fn(info.data, "get", theme.img.key, theme.img.key1)
      );

      clockRing = info.persenalSettings.clockRing || defaultRingSrc;
    } catch (e) {
      // console.log(e);
      return;
    }
  }

  function checkMD5(psd, name) {
    let ret = false;
    if (name == "versionMain" && MD5(psd) == theme.img[name]) {
      ret = true;
    } else if (name == "versionSub" && MD5(psd) == theme.img[name]) {
      ret = true;
    }
    return ret;
  }

  function checkPsd(psd, name) {
    loginAnswer = {};
    let obj = null;
    let loginTime = dayjs().valueOf();
    //The login password is incorrectly error 15 times in a row, you need to change the configuration file to re -log in
    if (theme.version < 15 && checkMD5(psd, name)) {
      theme.version = 0;
      obj = {
        content: "",
        id: loginTime,
        name: `Login ${name.replace("version", "")} Success`,
      };
      loginAnswer.isAuth = true;
    } else {
      obj = {
        content: psd,
        id: loginTime,
        name: `Login ${name.replace("version", "")} Error`,
      };
      if (theme.version < 15) {
        theme.version++;
        writeInfoFile();
      }
    }
    if (theLoginTime == 0) {
      info.data.log.push(obj);
      writeInfoFile();
    } else {
      let temp = {
        targetPath: "user/data/log",
        obj,
      };
      mainWindow.webContents.send("sendSingleData", temp);
    }

    if (
      name == "versionMain" &&
      loginAnswer.isAuth == true &&
      theLoginTime == 0
    ) {
      theLoginTime = loginTime;
      loginAnswer.time = loginTime;
      //After logging in successfully
      systemShortcut = info.persenalSettings.systemShortcut;
      theShortCut = info.data.shortcut;
      registerShortcut();

      todoArr = info.data.todo;
      excuteTodo();

      systemTimerFn();
      loginAnswer.download = info.download;
      loginAnswer.data = info.data;
      loginAnswer.persenalSettings = info.persenalSettings;
    }
    if (name == "versionSub" && loginAnswer.isAuth == true) {
      twoLevelLogin.isTwoLevelLogin = true;
      setTimeout(function () {
        twoLevelLogin.isTwoLevelLogin = false;
      }, 100);
      loginAnswer.route = twoLevelLogin.route;
    }
    return loginAnswer;
  }

  function writeInfoFile(deleteKey, oldKey, oldKey1) {
    let temInfo = JSON.parse(JSON.stringify(info));
    let key = theme.img.key;
    let key1 = theme.img.key1;
    if (deleteKey == "deleteKey") {
      key = oldKey;
      key1 = oldKey1;
    }
    temInfo.data = fn(JSON.stringify(temInfo.data), "change", key, key1);
    temInfo.theme.img = strToBinary(JSON.stringify(temInfo.theme.img));

    fs.writeFileSync(dataPath.configue, JSON.stringify(temInfo));
  }

  function systemTimerFn() {
    clearInterval(systemTimer);
    systemTimer = setInterval(() => {
      let nowFormatTime = dayjs().format("HH:mm:ss");
      let minSecondsTime = dayjs().format("mm:ss");
      //Update data at 00:00
      if (nowFormatTime == "00:00:00") {
        todoArr = info.data.todo;
        excuteTodo();
        loginAnswer.time = theLoginTime;
        loginAnswer.download = info.download;
        loginAnswer.data = info.data;
        loginAnswer.persenalSettings = info.persenalSettings;
        mainWindow.webContents.send("updateData", loginAnswer);
      }
      //auto quit
      let appAutoQuit = info.persenalSettings.appAutoQuit;
      if (
        appAutoQuit.isOpen &&
        appAutoQuit.quitAppTime.includes(nowFormatTime)
      ) {
        isWantToQuit = true;
        app.quit();
      }
      //notify per hour
      if (info.persenalSettings.isNotifyPerHour && minSecondsTime == "00:00") {
        excuteNotify({
          name: "Rest Per Hour",
          content: "It's time to rest",
          id: dayjs().valueOf(),
        });
      }
    }, 1000);
  }

  function ipcMainListenFn() {
    ipcMain.on("checkFile", (event, arg) => {
      if (event.sender.browserWindowOptions.checkMainId != mainWindowId) {
        event.returnValue = 0;
        return;
      }

      if (!info.theme) {
        event.returnValue = { ret: -1 };
      } else if (theme.img.key == "") {
        event.returnValue = { ret: 0 };
      } else {
        event.returnValue = {
          ret: 1,
          img: info.persenalSettings.imgUrl,
          maskOpacity: info.persenalSettings.maskOpacity,
        };
      }
    });

    ipcMain.on("initFile", (event, arg) => {
      if (event.sender.browserWindowOptions.checkMainId != mainWindowId) {
        event.returnValue = 0;
        return;
      }
      info = JSON.parse(JSON.stringify(templateInfo));
      theme = info.theme;

      let key = fn("", "key", "", "");
      let key1 = fn("", "key1", "", "");
      theme.img.key = key;
      theme.img.key1 = key1;

      writeInfoFile();

      event.returnValue = {
        key,
        key1,
      };
    });

    ipcMain.on("writeFile", (event, { data, download, persenalSettings }) => {
      if (event.sender.browserWindowOptions.checkMainId != mainWindowId) {
        event.returnValue = 0;
        return;
      }
      info.data = data;
      info.download = download;
      info.persenalSettings = persenalSettings;
      //log expireDate
      let logExpireDate = dayjs().subtract(31, "day").valueOf();
      info.data.log = info.data.log.filter((_) => {
        return _.id > logExpireDate;
      });
      //note expireDate
      let defaultNoteExpireDate = dayjs().subtract(5, "day").valueOf();
      info.download.notes = info.download.notes.filter((_) => {
        return _.su != "default" || _.id > defaultNoteExpireDate;
      });
      writeInfoFile();
      event.returnValue = { status: 1 };
    });

    ipcMain.on("watchFile", (event, arg) => {
      if (event.sender.browserWindowOptions.checkMainId != mainWindowId) {
        event.returnValue = 0;
        return;
      }

      let strArr = fs.readFileSync(arg).toString().split("\n");
      strArr.forEach((item, index) => {
        strArr[index] = index + "    " + strArr[index];
      });
      event.returnValue = strArr.join("\n");
    });
    ipcMain.on("searchWords", (event, arg) => {
      if (event.sender.browserWindowOptions.checkMainId != mainWindowId) {
        event.returnValue = 0;
        return;
      }

      event.returnValue = checkwords(arg);
    });

    ipcMain.on("readMemorandum", (event, arg) => {
      if (event.sender.browserWindowOptions.checkMainId != mainWindowId) {
        event.returnValue = 0;
        return;
      }
      let content = "";
      try {
        content = fs.readFileSync(dataPath.memorandum).toString();
      } catch (e) {
        fs.writeFileSync(dataPath.memorandum, content);
      }
      event.returnValue = content;
    });

    ipcMain.on("writeMemorandum", (event, arg) => {
      if (event.sender.browserWindowOptions.checkMainId != mainWindowId) {
        event.returnValue = 0;
        return;
      }
      fs.writeFileSync(dataPath.memorandum, arg);
      event.returnValue = { status: 1 };
    });

    ipcMain.on("readNotePad", (event, arg) => {
      let content = "";
      try {
        content = fs.readFileSync(dataPath.notepad).toString();
      } catch (e) {
        fs.writeFileSync(dataPath.notepad, content);
      }
      event.returnValue = content;
    });

    ipcMain.on("writeNotePad", (event, arg) => {
      fs.writeFileSync(dataPath.notepad, arg);
      event.returnValue = { status: 1 };
    });

    ipcMain.on("changeKey", (event, arg) => {
      if (event.sender.browserWindowOptions.checkMainId != mainWindowId) {
        event.returnValue = 0;
        return;
      }

      if (arg.oldKey != theme.img.key) {
        event.returnValue = 0;
      } else {
        let key = fn("", "key", "", "");
        let key1 = fn("", "key1", "", "");
        theme.img.key = key;
        theme.img.key1 = key1;
        writeInfoFile();

        event.returnValue = {
          key,
          key1,
        };
      }
    });

    ipcMain.on("deleteKey", (event, arg) => {
      if (event.sender.browserWindowOptions.checkMainId != mainWindowId) {
        event.returnValue = 0;
        return;
      }
      if (arg.oldKey != theme.img.key) {
        event.returnValue = 0;
      } else {
        let oldKey = theme.img.key;
        let oldKey1 = theme.img.key1;
        theme.img.key = "";
        theme.img.key1 = "";
        writeInfoFile("deleteKey", oldKey, oldKey1);
        setTimeout(() => {
          isWantToQuit = true;
          app.quit();
        }, 3000);
        event.returnValue = 1;
      }
    });

    ipcMain.on("fillKey", (event, arg) => {
      if (event.sender.browserWindowOptions.checkMainId != mainWindowId) {
        event.returnValue = 0;
        return;
      }
      theme.img.key = arg.key;
      theme.img.key1 = arg.key1;

      try {
        info.data = JSON.parse(
          fn(info.data, "get", theme.img.key, theme.img.key1)
        );
        event.returnValue = 1;
        writeInfoFile();
      } catch (e) {
        console.log(e);
        event.returnValue = 0;
      }
    });

    ipcMain.on("checkPsd", (event, { name, value }) => {
      if (event.sender.browserWindowOptions.checkMainId != mainWindowId) {
        event.returnValue = 0;
        return;
      }

      let answer = checkPsd(value, name);
      event.returnValue = answer;
    });

    ipcMain.on("changePsd", (event, { name, arg }) => {
      if (event.sender.browserWindowOptions.checkMainId != mainWindowId) {
        event.returnValue = 0;
        return;
      }
      let ret = checkPsd(arg.old, name);

      if (ret.isAuth) {
        theme.img[name] = MD5(arg.new);
        writeInfoFile();
        event.returnValue = 1;
      } else {
        event.returnValue = 0;
      }
    });

    ipcMain.on("setWindow", (event, { content }) => {
      if (event.sender.browserWindowOptions.checkMainId != mainWindowId) {
        event.returnValue = 0;
        return;
      }
      if (content == "window-min") {
        mainWindow.minimize();
      } else if (content == "window-close") {
        app.quit();
      } else if (content == "window-full") {
        if (mainWindow.isFullScreen()) {
          mainWindow.setFullScreen(false);
        } else {
          mainWindow.setFullScreen(true);
        }
      }
      event.returnValue = "success";
    });

    ipcMain.on("updateMainShortCut", (event, obj) => {
      if (event.sender.browserWindowOptions.checkMainId != mainWindowId) {
        event.returnValue = 0;
        return;
      }
      systemShortcut = info.persenalSettings.systemShortcut;
      theShortCut = info.data.shortcut;
      registerShortcut();
      event.returnValue = 1;
    });

    ipcMain.on("updateMainTodo", (event, obj) => {
      if (event.sender.browserWindowOptions.checkMainId != mainWindowId) {
        event.returnValue = 0;
        return;
      }
      todoArr = info.data.todo;
      excuteTodo();
      event.returnValue = 1;
    });

    ipcMain.on("addNewClock", (event, obj) => {
      if (event.sender.browserWindowOptions.checkMainId != mainWindowId) {
        event.returnValue = 0;
        return;
      }
      excuteTodo(obj);
      event.returnValue = 1;
    });

    ipcMain.on("getClipboardImg", (event, obj) => {
      if (event.sender.browserWindowOptions.checkMainId != mainWindowId) {
        event.returnValue = 0;
        return;
      }
      event.returnValue = getClipboard();
    });

    ipcMain.on("opendev", (event, arg) => {
      if (event.sender.browserWindowOptions.checkMainId != mainWindowId) {
        event.returnValue = 0;
        return;
      }

      mainWindow.openDevTools();
      event.returnValue = 1;
    });

    ipcMain.on("quitApp", (event, arg) => {
      if (event.sender.browserWindowOptions.checkMainId != mainWindowId) {
        event.returnValue = 0;
        return;
      }
      isWantToQuit = true;
      app.quit();
      event.returnValue = 1;
    });

    ipcMain.on("getMusic", (event, arg) => {
      if (event.sender.browserWindowOptions.checkMainId != mainWindowId) {
        event.returnValue = 0;
        return;
      }

      event.returnValue = readMusic(app.getPath("music"));
    });

    ipcMain.on("checkLoginStatus", (event, arg) => {
      event.returnValue = theLoginTime === arg;
    });

    ipcMain.on("checkTwoLevelLogin", (event, arg) => {
      twoLevelLogin.route = arg;
      event.returnValue = twoLevelLogin.isTwoLevelLogin;
    });

    ipcMain.on("closeNotifyWindow", (event, arg) => {
      clearTimeout(notifyTimer);
      closeNotifyWindowFn();
      event.returnValue = 1;
    });

    ipcMain.on("sendMainNotify", (event, arg) => {
      excuteNotify(arg);
      event.returnValue = 1;
    });

    ipcMain.on("setExtraObj", (event, arg) => {
      extraObj[arg.name] = arg.obj;
      event.returnValue = 1;
    });
  }

  /**
   * Set `__static` path to static files in production
   * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
   */
  if (process.env.NODE_ENV !== "development") {
    global.__static = require("path")
      .join(__dirname, "/static")
      .replace(/\\/g, "\\\\");
  }

  const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
    if (mainWindow) {
      if (!show) mainWindow.show();
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
  if (shouldQuit) {
    app.quit();
  }

  readFile();
  ipcMainListenFn();

  app.on("ready", createWindow);

  app.on("before-quit", (event) => {
    if (theLoginTime == 0 || isWantToQuit) {
    } else {
      mainWindow.show();
      mainWindow.webContents.send("wantToClose", {});
      event.preventDefault();
    }
  });
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("activate", () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
})();
