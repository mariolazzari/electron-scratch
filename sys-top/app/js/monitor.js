const path = require("path");
const { cpu, mem, os } = require("node-os-utils");

const DAY = 3600 * 24;

// format seconds
const secondsToDhms = (seconds) => {
  seconds = +seconds;
  const d = Math.round(seconds / DAY);
  const h = Math.round((seconds % DAY) / 3600);
  const m = Math.round((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);

  return `${d}d, ${h}h, ${m}m, ${s}s`;
};

// send notification
const notifyUser = (options) => {
  new Notification(options.title, options);
};

// check time notification
const checkNotify = (frequency) => {
  if (localStorage.getItem("lastNotify") === null) {
    // Store timestamp
    localStorage.setItem("lastNotify", +new Date());
    return true;
  }
  const notifyTime = new Date(parseInt(localStorage.getItem("lastNotify")));
  const now = new Date();
  const diffTime = Math.abs(now - notifyTime);
  const minutesPassed = Math.ceil(diffTime / (1000 * 60));

  if (minutesPassed > frequency) {
    return true;
  } else {
    return false;
  }
};

// settings
let cpuOverload = 85;
let alertFrequency = 1;

// run every 2 seconds
setInterval(() => {
  // CPU usage
  cpu.usage().then((info) => {
    document.getElementById("cpu-usage").innerText = `${info}%`;
    // cpu progress bar
    document.getElementById("cpu-progress").style.width = `${info}%`;
    // Make progressbar red on overload
    document.getElementById("cpu-progress").style.background =
      info > cpuOverload ? "red" : "#30c88b";
    // check overload interval
    if (info > cpuOverload && checkNotify(alertFrequency)) {
      notifyUser({
        title: "CPU overload",
        body: `CPU is over ${cpuOverload}%.`,
        icon: path.join(__dirname, "img", "icon.png"),
      });

      localStorage.setItem("lastNotify", +new Date());
    }
  });

  // CPU free
  cpu
    .free()
    .then(
      (info) => (document.getElementById("cpu-free").innerText = `${info}%`)
    );

  // Uptime
  document.getElementById("sys-uptime").innerText = secondsToDhms(os.uptime());
}, 2000);

// set model
document.getElementById("cpu-model").innerText = cpu.model();
// computer name
document.getElementById("comp-name").innerText = os.hostname();
// OS name
document.getElementById("os").innerText = `${os.type()} ${os.arch()}`;
// Memory
mem
  .info()
  .then(
    (info) => (document.getElementById("mem-total").innerText = info.totalMemMb)
  );
