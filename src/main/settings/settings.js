import {ipcMain} from "electron";
import { settingsDB } from "../db/db";
import dayjs from "dayjs";
import axios from "../util/source/axios";
import host from "../../renderer/src/utils/const/host";
import packageJson from '../../../package.json'


ipcMain.handle('get-download-setting', getDownloadSetting)
ipcMain.handle('set-download-setting', setDownloadSetting)
ipcMain.handle('check-show-disclaimer', checkShowDisclaimer)
ipcMain.handle('get-disclaimer-info', getDisclaimerInfo)
ipcMain.handle('set-agree-disclaimer-setting', setAgreeDisclaimerSetting)
ipcMain.handle('get-current-soft-version', getCurrentSoftVersion)

/**
 * 设置
 * @returns {*|{}}
 */
export function getDownloadSetting () {
    const downloadSetting = settingsDB.data.settings.downloadSetting
    return downloadSetting || {}
}

async function setDownloadSetting (event, data) {
    const downloadSetting = settingsDB.data.settings.downloadSetting
    if(downloadSetting) {
        downloadSetting.downloadPath = data.downloadPath
    } else {
        settingsDB.data.settings.downloadSetting = {
            downloadPath: data.downloadPath,
        }
    }
    await settingsDB.write()
}

/**
 * 设置免责申明
 * @returns {Promise<void>}
 */
async function setDisclaimerSetting(isAgree, saveTime, expiredTime, info) {
    const disclaimerSetting = settingsDB.data.settings.disclaimerSetting
    if(disclaimerSetting) {
        disclaimerSetting.isAgree = isAgree
        disclaimerSetting.saveTime = saveTime
        disclaimerSetting.expiredTime = expiredTime
        disclaimerSetting.info = info
    } else {
        settingsDB.data.settings.disclaimerSetting = {
            isAgree: isAgree,
            saveTime: saveTime,
            expiredTime: expiredTime,
            info: info
        }
    }
    await settingsDB.write()
}

/**
 * 保存用户的同意的行为
 * @param agree
 * @returns {Promise<void>}
 */
async function setAgreeDisclaimerSetting(event, agree) {
    const disclaimerSetting = settingsDB.data.settings.disclaimerSetting
    if(disclaimerSetting) {
        disclaimerSetting.isAgree = agree
    }
    await settingsDB.write()
}

/**
 * 获取免责申明
 * @returns {Promise<void>}
 */
async function getDisclaimerInfo() {
    const disclaimerSetting = settingsDB.data.settings.disclaimerSetting
    return JSON.parse(JSON.stringify(disclaimerSetting || {}))
}

/**
 * 校验显示免责申明
 */
async function checkShowDisclaimer() {
    const disclaimerSetting = settingsDB.data.settings.disclaimerSetting
    const currentTime = dayjs().format('YYYY-MM-DD')
    if(disclaimerSetting && disclaimerSetting.info && disclaimerSetting.isAgree && dayjs(currentTime).isBefore(dayjs(disclaimerSetting.expiredTime))) {
        if(dayjs(currentTime).isBefore(dayjs(disclaimerSetting.saveTime))) {
            return true
        } else {
            const response = await axios.get(`${host.server}mini/systemConfig/disclaimer`)
            const info = response.data.result.cookie
            if(info === disclaimerSetting.info) {
                const expiredTime = response.data.result.expiredTime
                const saveTime = dayjs().add(3, 'day').format('YYYY-MM-DD')
                await setDisclaimerSetting(false, saveTime, expiredTime, info)
                return true
            } else {
                const expiredTime = response.data.result.expiredTime
                const saveTime = dayjs().add(3, 'day').format('YYYY-MM-DD')
                await setDisclaimerSetting(false, saveTime, expiredTime, info)
                return false;
            }
        }
    } else {
        const response = await axios.get(`${host.server}mini/systemConfig/disclaimer`)
        const info = response.data.result.cookie
        const expiredTime = response.data.result.expiredTime
        const saveTime = dayjs().add(3, 'day').format('YYYY-MM-DD')
        await setDisclaimerSetting(false, saveTime, expiredTime, info)
        return false;
    }
}

function getCurrentSoftVersion () {
    return packageJson.version
}

