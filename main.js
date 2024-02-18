const { app, BrowserWindow } = require('electron');
const path = require("path");
const url = require("url");

app.disableHardwareAcceleration()

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        },
        autoHideMenuBar: true,
        icon: __dirname + '/www/assets/logo_small_default.png'
    });

    win.loadURL(
        url.format({
            pathname: path.join(__dirname, '/www/index.html'),
            protocol: "file:",
            slashes: true
        })
    );

    // Use this for inspecting in development
    //  mainWindow.webContents.openDevTools();

    // if (process.env.NODE_ENV === 'development') {
    //     app.commandLine.appendSwitch('remote-debugging-port', '9222');
    //     app.commandLine.appendSwitch('inspect', 'true');
    // }

    // SQLite stuff
    //  let server = require('./sqlite_server/server.js')


    win.on('closed', () => {
        //win = null;
    });
    win.maximize();
}

app.on('ready', createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
