// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import {contextBridge, ipcRenderer} from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
    // 渲染器进程到主进程（双向）
    generateVideo: ( url, name, outPath) => ipcRenderer.invoke('generate-video',  url, name, outPath),
    checkOutputFileNotExist: (outputPath) => ipcRenderer.invoke('check-output-file-not-exist',  outputPath),
    getDownloadSetting: () => ipcRenderer.invoke('get-download-setting'),
    setDownloadSetting: (data) => ipcRenderer.invoke('set-download-setting',  data),
    openDirectoryDialog: () => ipcRenderer.invoke('open-directory-dialog'),
    getFinishList: () => ipcRenderer.invoke('get-m3u8-finish-list'),
    deleteM3u8FinishedRecord: (id) => ipcRenderer.invoke('delete-m3u8-finished-record', id),
    deleteFinishedRecordAndFile: (id) => ipcRenderer.invoke('delete-m3u8-record-and-file', id),
    // 渲染器进程到主进程（单向）
    quitApp: () => ipcRenderer.send('quit-app'),
    updateMenus: () => ipcRenderer.send('update-menus'),
    goToDirectory: (path) => ipcRenderer.send('go-to-directory', path),
    // 主进程到渲染器进程
    getM3u8DownloadTips: (callback) => ipcRenderer.on('m3u8-download-tip', callback),
    getM3u8DownloadSuccess: (callback) => ipcRenderer.on('m3u8-download-success', callback),
})

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const dependency of ['chrome', 'node', 'electron']) {
        replaceText(`${dependency}-version`, process.versions[dependency] + "222")
    }
})