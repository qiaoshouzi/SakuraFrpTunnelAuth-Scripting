import type { TapAction } from '../types'

export const getTapDefaultActionFromStore = (): TapAction => {
  const result = Storage.get<string>('tapDefaultAction')
  if (result && ['self', 'ip'].includes(result)) return result as TapAction
  else return 'self'
}
export const getForceExternalV4ApiFromStore = (): boolean => {
  const result = Storage.get<boolean>('forceExternalV4Api')
  if (result !== null) return result
  return true
}
