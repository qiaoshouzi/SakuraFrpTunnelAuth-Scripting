import { AppIntentManager, AppIntentProtocol, Widget } from 'scripting'
import { getIP, tunnelAuth } from './utils/SakuraFrpAPI'
import { getForceExternalV4ApiFromStore } from './utils/store'

export const ReloadWidgetIntent = AppIntentManager.register({
  name: 'ReloadWidgetIntent',
  protocol: AppIntentProtocol.AppIntent,
  perform: async () => {
    console.log('ReloadWidgetIntent')
    Widget.reloadAll()
  },
})

export const ShowErrorWidgetIntent = AppIntentManager.register({
  name: 'ShowErrorWidgetIntent',
  protocol: AppIntentProtocol.AppIntent,
  perform: async ({ title, message }: { title?: string; message: string }) => {
    console.log('ShowErrorWidgetIntent')
    const result = await Dialog.confirm({
      title,
      message,
      cancelLabel: '确定',
      confirmLabel: '重试',
    })
    if (result) Widget.reloadAll()
  },
})

export const AuthTunnelWidgetIntent = AppIntentManager.register({
  name: 'AuthTunnelWidgetIntent',
  protocol: AppIntentProtocol.AppIntent,
  perform: async (id: number) => {
    console.log('AuthTunnelWidgetIntent')
    let ip = await Dialog.prompt({
      title: '输入要授权的IP',
      message: '留空使用本机IP',
    })
    if (!ip && ip !== '') return
    if (ip.trim() === '') {
      const forceExternalV4Api = getForceExternalV4ApiFromStore()
      if (forceExternalV4Api) {
        const result = await getIP()
        if ('error' in result) {
          Dialog.alert({
            title: '授权失败',
            message: `从外部API获取IP失败: ${result.error}`,
          })
          return
        } else ip = result.body
      }
    }

    const token = Keychain.get('user_token')
    if (!token) {
      Dialog.alert({
        title: '授权失败',
        message: '未登录',
      })
      return
    }
    const result = await tunnelAuth(token, id, ip ?? undefined)
    if ('error' in result)
      Dialog.alert({
        title: '授权失败',
        message: `${ip ? `(${ip})` : ''}: ${result.error}`,
      })
    else
      Dialog.alert({
        title: '授权成功',
        message: `${result.body}`,
      })
  },
})
