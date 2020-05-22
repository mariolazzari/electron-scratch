const { app, BrowserWindow, Menu } = require("electron");

// enviroment settings
process.env.NODE_ENV = "development";
const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";

// app main window
let mainWindow;

// create main window
const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 600,
    title: "Image Shrink",
    icon: "./assets/icons/Icon_256x256.png",
    resizable: isDev,
  });

  // load index file
  //mainWindow.loadURL(`file://${__dirname}/app/index.html`);
  mainWindow.loadFile("./app/index.html");
};

// create main window when app is ready
app.on("ready", () => {
  createMainWindow();

  // setup menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  // garbage collector
  mainWindow.on("ready", () => {
    mainWindow = null;
  });
});

// Main menu template
const menu = [
  ...(isMac ? [{ role: "appMenu" }] : []),
  { label: "File", submenu: [{ label: "Quit", click: () => app.quit() }] },
];
// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (!isMac) {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
