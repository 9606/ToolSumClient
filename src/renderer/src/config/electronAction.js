/**
 * Api 监听来自main进程的发起的请求
 */
import { useService } from "../service/service";


window.electronAPI.getM3u8DownloadTips(async (event, status, content) => {
    useService("showM3u8DownloadMessage", status, content)
})