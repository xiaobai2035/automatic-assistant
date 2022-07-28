import self from "../../main";

export function upperCaseFn(str) {
  if (str == "") return "";
  return str.substring(0, 1).toLocaleUpperCase() + str.substring(1);
}
export function writeFile(message, update) {
  if (!message) {
    message = {
      message: "Operate successfully",
      type: "success",
    };
  }
  var res = self.$electron.ipcRenderer.sendSync("writeFile", {
    data: self.$store.state.Auth.user.data,
    download: self.$store.state.Auth.user.download,
    persenalSettings: self.$store.state.Auth.user.persenalSettings,
  });
  if (update == "updateMainShortCut") {
    self.$electron.ipcRenderer.sendSync("updateMainShortCut", {});
  }
  if (update == "updateMainTodo") {
    self.$electron.ipcRenderer.sendSync("updateMainTodo", {});
  }

  if (res.status == 1) {
    if (message == "no message") {
    } else {
      self.$message(message);
    }
  } else {
    self.$message.error("Perhaps the file does not exist");
  }
}
export function random(a, b) {
  return Math.floor(Math.random() * b) + a;
}
export function talkFn(str) {
  let moodStr = `(*^▽^*)\n(〃'▽'〃)\nლ(°◕‵ƹ′◕ლ)\n(♡˙︶˙♡)\nΣ>―(〃°ω°〃)♡→\n(╭￣3￣)╭♡\n(●▼●;)\nΣ(;ﾟдﾟ)\n(｡•ㅅ•｡)♡\n∑(￣□￣;)\n( ºωº )\n☝( ◠‿◠ )☝\n(づ′▽')づ\n(◍•ᴗ•◍)ゝ\n(^y^)\n(*’ｰ’*)`;
  let tempStr = "wait a mement";
  let temp = [
    {
      content: "(*^▽^*)\n(〃'▽'〃)\nლ(°◕‵ƹ′◕ლ)\n(♡˙︶˙♡)",
      id: 1652430110002,
      name: "xiaoyu",
      su: "",
    },
    {
      content: "morning\n(*^▽^*)\ngood morning",
      id: 1652430110004,
      name: "good morning",
      su: "",
    },
    {
      content: "ლ(°◕‵ƹ′◕ლ)\ngood afternoon",
      id: 1652430110005,
      name: "good afternoon",
      su: "",
    },
    {
      content: "(〃'▽'〃)\ngood evening",
      id: 1652430110006,
      name: "good evening",
      su: "",
    },
  ];
  temp = temp.concat(
    self.$store.getters.getResult({
      pathStr: "user/data/record",
      subject: "book",
    })
  );
  let ret = "";
  for (let i = 0; i < temp.length; i++) {
    if (str.includes(temp[i].name)) {
      let arr = temp[i].content.split("\n");
      ret = arr[random(0, arr.length)];
      break;
    }
  }
  if (ret == "") {
    let moodarr = moodStr.split("\n");
    let arr = tempStr.split("\n").concat(moodarr);
    ret = arr[random(0, arr.length)];
  }
  return ret;
}
