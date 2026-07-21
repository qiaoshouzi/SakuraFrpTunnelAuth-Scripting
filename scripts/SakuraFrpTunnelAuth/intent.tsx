import { Intent, Script } from 'scripting'
import { getIP, tunnelAuth } from './utils/SakuraFrpAPI'
import { getForceExternalV4ApiFromStore } from './utils/store'

const main = async () => {
  const parameter = Intent.textsParameter
  if (!parameter) return '未输入隧道ID'
  const ids = parameter.map((v) => Number(v))
  if (ids.findIndex((v) => !Number.isInteger(v)) !== -1) return '存在非法隧道ID'
  const token = Keychain.get('user_token')
  if (!token) return '未登录'

  const forceExternalV4Api = getForceExternalV4ApiFromStore()
  let ip: string | undefined = undefined
  if (forceExternalV4Api) {
    const result = await getIP()
    if ('error' in result) {
      return `授权失败:从外部API获取IP失败: ${result.error}`
    } else ip = result.body
  }

  const list = []
  for (const id of ids) {
    const result = await tunnelAuth(token, id, ip ?? undefined)
    if ('error' in result) list.push(`[${id}] 授权失败: ${ip ? `(${ip})` : ''}: ${result.error}`)
    else list.push(`[${id}] 授权成功: ${result.body}`)
  }
  return list.join('\n')
}
main().then((v) => {
  Script.exit(Intent.text(String(v)))
})
