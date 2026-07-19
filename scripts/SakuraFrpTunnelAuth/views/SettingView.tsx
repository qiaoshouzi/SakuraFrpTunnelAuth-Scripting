import {
  Button,
  HStack,
  Image,
  List,
  Navigation,
  NavigationStack,
  Picker,
  ProgressView,
  Section,
  SetStateAction,
  Text,
  Toggle,
  useCallback,
  useEffect,
  useState,
  VStack,
} from 'scripting'
import { TapAction } from '../types'
import { getUserInfo, UserInfo } from '../utils/SakuraFrpAPI'
import LoginView from './LoginView'

type LoginInfo =
  | {
      state: 'logout'
    }
  | {
      state: 'logged'
      data: UserInfo
    }

function ErrorView({
  error,
  refresh,
  token,
  logout,
}: {
  error: string
  token?: string
  refresh: () => void
  logout: () => void
}) {
  return (
    <>
      <Text foregroundStyle="systemRed">{error}</Text>
      <Button title="刷新" action={refresh} />
      {token !== undefined && <Button role="destructive" title="退出登陆" action={logout} />}
    </>
  )
}

function LoadingView() {
  return <Text>加载中~</Text>
}

function LogoutView({ success }: { success?: (token: string) => void }) {
  return (
    <Button
      title="登陆"
      action={() => {
        Navigation.present({
          element: <LoginView success={success} />,
        })
      }}
    />
  )
}

function LoggedView({ data, logout }: { data: UserInfo; logout: () => void }) {
  return (
    <>
      <HStack>
        <Image
          imageUrl={data.avatar}
          scaleToFit
          resizable
          clipShape="circle"
          aspectRatio={{ contentMode: 'fit' }}
          frame={{ height: 50, width: 50 }}
          placeholder={<ProgressView />}
        />
        <VStack alignment="leading">
          <Text font="headline" bold>
            {data.name}
          </Text>
          <Text font="callout" foregroundStyle="secondaryLabel">
            {data.id}
          </Text>
        </VStack>
      </HStack>
      <Button role="destructive" title="退出登陆" action={logout} />
    </>
  )
}

export default function SettingView({
  token,
  setToken,
  tapDefaultAction,
  setTapDefaultAction,
  forceExternalV4Api,
  setForceExternalV4Api,
}: {
  token: string | undefined
  setToken: (state: SetStateAction<string | undefined>) => void
  tapDefaultAction: TapAction
  setTapDefaultAction: (state: SetStateAction<TapAction>) => void
  forceExternalV4Api: boolean
  setForceExternalV4Api: (state: SetStateAction<boolean>) => void
}) {
  const [loginState, setLoginState] = useState<LoginInfo>()
  const [error, setError] = useState<string>()
  const refreshLoginState = useCallback(async () => {
    setError(undefined)
    if (!token) {
      setLoginState({ state: 'logout' })
      return
    }
    setLoginState(undefined)
    const result = await getUserInfo(token)
    if ('error' in result) setError(result.error)
    else
      setLoginState({
        state: 'logged',
        data: result.body,
      })
  }, [token])
  useEffect(() => {
    refreshLoginState()
  }, [token])
  const logout = useCallback(() => {
    setToken(undefined)
    Keychain.remove('user_token')
  }, [])

  return (
    <NavigationStack>
      <List navigationTitle="SakuraFrp 访问认证" navigationBarTitleDisplayMode={'inline'}>
        <Section>
          {error !== undefined && (
            <ErrorView error={error} refresh={refreshLoginState} token={token} logout={logout} />
          )}
          {loginState === undefined && !error && <LoadingView />}
          {loginState?.state === 'logout' && !error && <LogoutView success={setToken} />}
          {loginState?.state === 'logged' && !error && (
            <LoggedView data={loginState.data} logout={logout} />
          )}
        </Section>

        <Section>
          <Picker
            title={'点击默认事件'}
            value={tapDefaultAction}
            onChanged={setTapDefaultAction as any}
            pickerStyle={'menu'}
          >
            <Text tag="self">授权本机IP</Text>
            <Text tag="ip">输入IP</Text>
          </Picker>
          <Toggle
            title="强制从外部API获取IPv4"
            value={forceExternalV4Api}
            onChanged={setForceExternalV4Api}
          />
        </Section>
      </List>
    </NavigationStack>
  )
}
