import { Navigation, Script, Tab, TabView, useEffect, useObservable, useState } from 'scripting'
import type { TapAction } from './types'
import { getForceExternalV4ApiFromStore, getTapDefaultActionFromStore } from './utils/store'
import HomeView from './views/HomeView'
import LoginView from './views/LoginView'
import SettingView from './views/SettingView'

function View() {
  const currentTabValue = useObservable<number>(0)
  const [token, setToken] = useState<string>()
  const [tapDefaultAction, setTapDefaultAction] = useState<TapAction>(
    getTapDefaultActionFromStore(),
  )
  const [forceExternalV4Api, setForceExternalV4Api] = useState<boolean>(
    getForceExternalV4ApiFromStore(),
  )

  useEffect(() => {
    const result = Keychain.get('user_token')
    if (!result) {
      Navigation.present({
        element: <LoginView success={setToken} />,
      })
    } else {
      setToken(result)
    }
  }, [])
  useEffect(() => {
    Storage.set('tapDefaultAction', tapDefaultAction)
  }, [tapDefaultAction])
  useEffect(() => {
    Storage.set('forceExternalV4Api', forceExternalV4Api)
  }, [forceExternalV4Api])

  return (
    <TabView selection={currentTabValue}>
      <Tab title="首页" systemImage="house.fill" value={0}>
        <HomeView
          token={token}
          tapDefaultAction={tapDefaultAction}
          forceExternalV4Api={forceExternalV4Api}
        />
      </Tab>
      <Tab title="设置" systemImage="gear" value={1}>
        <SettingView
          token={token}
          setToken={setToken}
          tapDefaultAction={tapDefaultAction}
          setTapDefaultAction={setTapDefaultAction}
          forceExternalV4Api={forceExternalV4Api}
          setForceExternalV4Api={setForceExternalV4Api}
        />
      </Tab>
    </TabView>
  )
}

Navigation.present({
  element: <View />,
}).then(() => Script.exit())
