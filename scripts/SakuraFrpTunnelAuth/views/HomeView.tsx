import {
  Button,
  ContentUnavailableView,
  Group,
  HStack,
  List,
  NavigationStack,
  Spacer,
  Text,
  useCallback,
  useEffect,
  useState,
  VStack,
} from 'scripting'
import { TapAction } from '../types'
import { getIP, getTunnels, tunnelAuth, TunnelInfo } from '../utils/SakuraFrpAPI'

function LoadingView() {
  return <Text>加载中~</Text>
}

function ErrorView({ error }: { error: string }) {
  return (
    <List>
      <Text foregroundStyle="systemRed">{`加载失败: ${error}`}</Text>
    </List>
  )
}

function LogoutView() {
  return <ContentUnavailableView title="未登录" systemImage="exclamationmark.circle" />
}

function TunnelListView({
  token,
  data,
  tapDefaultAction,
  forceExternalV4Api,
}: {
  token: string
  data: TunnelInfo[]
  tapDefaultAction: TapAction
  forceExternalV4Api: boolean
}) {
  const onClick = useCallback(
    async (type: 'self' | 'ip', id: number) => {
      let ip: string | null = null
      if (type === 'ip') {
        ip = await Dialog.prompt({
          title: '输入要授权的IP',
          message: '留空使用本机IP',
        })
        if (!ip && ip !== '') return
      }

      if (type === 'self' && forceExternalV4Api) {
        const result = await getIP()
        if ('error' in result) {
          Dialog.alert({
            title: '授权失败',
            message: `从外部API获取IP失败: ${result.error}`,
          })
          return
        } else ip = result.body
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
    [token, data, forceExternalV4Api],
  )

  return (
    <List listStyle="inset">
      {data.length === 0 && <Text>未找到开启了访问认证的隧道</Text>}
      {data.map((v) => (
        <Button action={() => onClick(tapDefaultAction, v.id)}>
          <HStack
            alignment="top"
            contextMenu={{
              menuItems: (
                <Group>
                  <Button title="授权本机IP" action={() => onClick('self', v.id)} />
                  <Button title="输入IP" action={() => onClick('ip', v.id)} />
                  <Button title="复制隧道ID" action={() => Pasteboard.setStrings([String(v.id)])} />
                </Group>
              ),
            }}
          >
            <VStack alignment="leading">
              <Text font="headline">{v.name}</Text>
              {v.note !== '' && (
                <Text font="callout" foregroundStyle="secondaryLabel">
                  {v.note}
                </Text>
              )}
            </VStack>
            <Spacer />
            <VStack alignment="trailing">
              <Text font="callout" foregroundStyle="secondaryLabel">
                #{v.id}
              </Text>
              <Text
                font="caption"
                fontWeight="medium"
                padding={{
                  horizontal: 10,
                  vertical: 5,
                }}
                background="systemBlue"
                clipShape="capsule"
                textCase="uppercase"
              >
                {v.type}
              </Text>
            </VStack>
          </HStack>
        </Button>
      ))}
    </List>
  )
}

export default function HomeView({
  token,
  tapDefaultAction,
  forceExternalV4Api,
}: {
  token?: string
  tapDefaultAction: TapAction
  forceExternalV4Api: boolean
}) {
  const [error, setError] = useState<string>()
  const [tunnels, setTunnels] = useState<TunnelInfo[]>()

  const refresh = useCallback(async () => {
    setError(undefined)
    setTunnels(undefined)
    if (!token) return

    const result = await getTunnels(token)
    if ('error' in result) setError(result.error)
    else setTunnels(result.body)
  }, [token])
  useEffect(() => {
    refresh()
  }, [token])

  return (
    <NavigationStack>
      <VStack
        navigationTitle="SakuraFrp 访问认证"
        navigationBarTitleDisplayMode={'inline'}
        toolbar={{
          primaryAction: [<Button title="刷新" systemImage="arrow.clockwise" action={refresh} />],
        }}
      >
        {error !== undefined && <ErrorView error={error} />}
        {!token && !error && <LogoutView />}
        {!tunnels && !error && <LoadingView />}
        {token !== undefined && tunnels && !error && (
          <TunnelListView
            token={token}
            data={tunnels
              .filter((v) => {
                const keys = v.extra.split('\n').map((v) => v.split(' = ')[0])
                return (
                  keys.findIndex((v) => ['auth_totp', 'auth_pass', 'auth_mode'].includes(v)) !== -1
                )
              })
              .filter((v) => v.online)}
            tapDefaultAction={tapDefaultAction}
            forceExternalV4Api={forceExternalV4Api}
          />
        )}
      </VStack>
    </NavigationStack>
  )
}
