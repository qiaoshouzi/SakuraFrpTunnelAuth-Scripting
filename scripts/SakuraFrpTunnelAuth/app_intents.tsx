import { AppIntentManager, AppIntentProtocol, Notification, Widget } from 'scripting'
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

export const AuthTunnelWidgetIntent = AppIntentManager.register({
  name: 'AuthTunnelWidgetIntent',
  protocol: AppIntentProtocol.AppIntent,
  perform: async (id: number) => {
    console.log('AuthTunnelWidgetIntent')
    const forceExternalV4Api = getForceExternalV4ApiFromStore()
    let ip: string | undefined = undefined
    if (forceExternalV4Api) {
      const result = await getIP()
      if ('error' in result) {
        await Notification.schedule({
          title: 'SakuraFrp 授权失败',
          body: `从外部API获取IP失败: ${result.error}`,
        })
        return
      } else ip = result.body
    }

    const token = Keychain.get('user_token')
    if (!token) {
      await Notification.schedule({
        title: 'SakuraFrp 授权失败',
        body: '未登录',
      })
      return
    }
    const result = await tunnelAuth(token, id, ip ?? undefined)
    if ('error' in result)
      await Notification.schedule({
        title: 'SakuraFrp 授权失败',
        body: `${ip ? `(${ip})` : ''}: ${result.error}`,
      })
    else
      await Notification.schedule({
        title: 'SakuraFrp 授权成功',
        body: result.body,
      })
  },
})
