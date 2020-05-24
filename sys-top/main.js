const { app, BrowserWindow, Menu } = require("electron");
const log = require("electron-log");

// Set env
process.env.NODE_ENV = "development";
const isDev = process.env.NODE_ENV === "development";
const isMac = process.platform === "darwin";

// main window
let mainWindow;
// create main window
const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    title: "SysTop",
    width: isDev ? 800 : 355,
    height: 500,
    icon: "./assets/icons/icon.png",
    resizable: isDev,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // open dev tools in dev mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // load main window
  mainWindow.loadFile("./app/index.html");
};

// on app ready create main window
app.on("ready", () => {
  createMainWindow();
  // main window menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);
});

// main menu template
const menu = [
  ...(isMac ? [{ role: "appMenu" }] : []),
  {
    role: "fileMenu",
  },
  ...(isDev
    ? [
        {
          label: "Developer",
          submenu: [
            { role: "reload" },
            { role: "forcereload" },
            { type: "separator" },
            { role: "toggledevtools" },
          ],
        },
      ]
    : []),
];

//  quit app on mac
app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});

// create only one main window
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.allowRendererProcessReuse = true;
