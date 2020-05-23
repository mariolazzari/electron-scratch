const imagemin = require("imagemin");
const imageminJpg = require("imagemin-mozjpeg");
const imageminPng = require("imagemin-pngquant");
const slash = require("slash");
const {
  app,
  BrowserWindow,
  Menu,
  globalShortcut,
  ipcMain,
  shell,
} = require("electron");
const log = require("electron-log");

// enviroment settings
process.env.NODE_ENV = "production";
const isDev = process.env.NODE_ENV === "development";
const isMac = process.platform === "darwin";

// app main window
let mainWindow;
let aboutWindow;

// create main window
const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: isDev ? 800 : 500,
    height: 600,
    title: "Image Shrink",
    icon: "./assets/icons/Icon_256x256.png",
    resizable: isDev,
    backgroundColor: "white",
    webPreferences: { nodeIntegration: true },
  });

  // open dev tools in dev mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // load index file
  //mainWindow.loadURL(`file://${__dirname}/app/index.html`);
  mainWindow.loadFile("./app/index.html");
};

// create about window
const createAboutWindow = () => {
  aboutWindow = new BrowserWindow({
    width: 300,
    height: 300,
    title: "About",
    icon: "./assets/icons/Icon_256x256.png",
    resizable: false,
    backgroundColor: "white",
  });

  // load index file
  aboutWindow.loadFile("./app/about.html");
};

// shrink image
const shrinkImage = async ({ imgPath, quality, dest }) => {
  try {
    const pngQuality = quality / 100;

    const files = await imagemin([slash(imgPath)], {
      destination: dest,
      plugins: [
        imageminJpg({ quality }),
        imageminPng({
          quality: [pngQuality, pngQuality],
        }),
      ],
    });

    log.info(files);
    shell.openPath(dest);
    mainWindow.webContents.send("image:done");
  } catch (ex) {
    log.error(ex);
  }
};

// subscribe image:minimize event
ipcMain.on("image:minimize", (e, options) => {
  shrinkImage(options);
});

// create main window when app is ready
app.on("ready", () => {
  createMainWindow();

  // setup menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);
  // global shortcuts
  globalShortcut.register("CmdOrCtrl+R", () => mainWindow.reload());
  globalShortcut.register(isMac ? "Command+Alt+I" : "Ctrl+Shift+I", () =>
    mainWindow.toggleDevTools()
  );

  // garbage collector
  mainWindow.on("ready", () => {
    mainWindow = null;
  });
});

// Main menu template
const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [{ label: "About", click: createAboutWindow }],
        },
      ]
    : []),
  { role: "fileMenu" },
  ...(isMac
    ? []
    : [
        {
          label: "Help",
          submenu: [{ label: "About", click: createAboutWindow }],
        },
      ]),
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
