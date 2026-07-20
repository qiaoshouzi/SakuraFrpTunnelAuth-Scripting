import {
  AppIntent,
  AppIntentProtocol,
  Button,
  HStack,
  Image,
  Notification,
  Rectangle,
  Spacer,
  Text,
  type VirtualNode,
  VStack,
  Widget,
  ZStack,
} from 'scripting'
import { AuthTunnelWidgetIntent, ReloadWidgetIntent } from './app_intents'
import { getTunnels } from './utils/SakuraFrpAPI'

function Layout({
  children,
  intent,
}: {
  children: VirtualNode
  intent: AppIntent<any, AppIntentProtocol>
}) {
  return (
    <ZStack>
      <Button buttonStyle="plain" intent={intent}>
        <Rectangle
          frame={{
            maxWidth: 'infinity',
            maxHeight: 'infinity',
          }}
          contentShape="rect"
          fill="clear"
        />
      </Button>
      {children}
    </ZStack>
  )
}

type MainViewParams = (
  | {
      type: 'info'
      iconName: string
      msg: string
    }
  | {
      type: 'auth'
      id: number
      name: string
      showBottom?: boolean // default true
    }
) & {
  lineLimit?: number // default 4
}
function MainView(params: MainViewParams) {
  return (
    <Layout
      intent={params.type === 'auth' ? AuthTunnelWidgetIntent(params.id) : ReloadWidgetIntent(null)}
    >
      <VStack spacing={0}>
        <VStack
          alignment="leading"
          spacing={0}
          padding={{
            top: 12,
            horizontal: 12,
            bottom: params.type === 'auth' && params.showBottom !== false ? undefined : 12,
          }}
        >
          {/* Header */}
          <HStack spacing={6}>
            {/* icon */}
            {params.type === 'auth' ? (
              <Image
                imageUrl="https://www.natfrp.com/favicon.ico"
                resizable
                renderingMode="original"
                aspectRatio={{ contentMode: 'fit' }}
                frame={{
                  width: 18,
                  height: 18,
                }}
                widgetAccentedRenderingMode="fullColor"
              />
            ) : (
              <Image
                systemName={params.iconName}
                font={15}
                fontWeight="bold"
                foregroundStyle="accentColor"
              />
            )}

            <Text font={13} fontWeight="bold" fontDesign="rounded" foregroundStyle="label">
              SakuraFrp
            </Text>
            <Spacer minLength={4} />
            <Button intent={ReloadWidgetIntent(null)} buttonStyle="plain">
              <Image
                systemName="arrow.clockwise"
                font={12}
                fontWeight="bold"
                foregroundStyle="secondaryLabel"
                padding={6}
                background={{
                  color: 'label',
                  opacity: 0.08,
                }}
                clipShape="circle"
              />
            </Button>
          </HStack>
          {/* <Spacer minLength={4} /> */}
          {/* Content */}
          <VStack
            alignment="leading"
            spacing={2}
            padding={{
              top: 4,
            }}
          >
            {params.type === 'auth' && (
              <Text font={9} fontWeight="bold" foregroundStyle="secondaryLabel" kerning={0.8}>
                #{params.id}
              </Text>
            )}
            <Text
              font="subheadline"
              fontDesign="rounded"
              fontWeight="bold"
              foregroundStyle="label"
              lineLimit={params.lineLimit ?? 4}
              minScaleFactor={0.7}
              multilineTextAlignment="leading"
              fixedSize={{
                horizontal: false,
                vertical: true,
              }}
            >
              {params.type === 'auth' ? params.name : params.msg}
            </Text>
          </VStack>
          <Spacer minLength={4} />
        </VStack>
        {/* Bottom */}
        {params.type === 'auth' && params.showBottom !== false && (
          <HStack
            spacing={4}
            foregroundStyle="white"
            padding={{
              vertical: 8,
            }}
            widgetBackground="accentColor"
          >
            <Spacer />
            <Image systemName="hand.tap.fill" font={10} />
            <Text font={10} fontWeight="semibold">
              点击任意区域授权
            </Text>
            <Spacer />
          </HStack>
        )}
      </VStack>
    </Layout>
  )
}

// 未登录
function LogoutView() {
  switch (Widget.family) {
    case 'accessoryCircular':
      return (
        <Layout intent={ReloadWidgetIntent(null)}>
          <Text>未登录</Text>
        </Layout>
      )
    case 'accessoryInline':
      return (
        <Layout intent={ReloadWidgetIntent(null)}>
          <Text>SakuraFrp 未登录</Text>
        </Layout>
      )

    default:
      return <MainView type="info" iconName="x.circle" msg="未登录" />
  }
}

// 非法隧道ID
function TunnelIDInvalidView() {
  switch (Widget.family) {
    case 'accessoryCircular':
      return (
        <Layout intent={ReloadWidgetIntent(null)}>
          <VStack>
            <Text>非法</Text>
            <Text>隧道ID</Text>
          </VStack>
        </Layout>
      )
    case 'accessoryInline':
      return (
        <Layout intent={ReloadWidgetIntent(null)}>
          <Text>SakuraFrp 非法隧道ID</Text>
        </Layout>
      )

    default:
      return <MainView type="info" iconName="x.circle" msg="非法隧道ID" />
  }
}

// 未输入隧道ID
function NoInputView() {
  switch (Widget.family) {
    case 'accessoryCircular':
      return (
        <Layout intent={ReloadWidgetIntent(null)}>
          <VStack>
            <Text>未输入</Text>
            <Text>隧道ID</Text>
          </VStack>
        </Layout>
      )
    case 'accessoryInline':
      return (
        <Layout intent={ReloadWidgetIntent(null)}>
          <Text>SakuraFrp 未输入隧道ID</Text>
        </Layout>
      )

    default:
      return <MainView type="info" iconName="x.circle" msg="未输入隧道ID" />
  }
}

// 隧道未找到
function TunnelIDNotfoundView() {
  switch (Widget.family) {
    case 'accessoryCircular':
      return (
        <Layout intent={ReloadWidgetIntent(null)}>
          <VStack>
            <Text>隧道</Text>
            <Text>未找到</Text>
          </VStack>
        </Layout>
      )
    case 'accessoryInline':
      return (
        <Layout intent={ReloadWidgetIntent(null)}>
          <Text>SakuraFrp 隧道未找到</Text>
        </Layout>
      )

    default:
      return <MainView type="info" iconName="x.circle" msg="隧道未找到" />
  }
}

function ErrorView({ message }: { message: string }) {
  Notification.schedule({
    title: 'SakuraFrp 出现错误',
    body: message,
  })
  switch (Widget.family) {
    case 'accessoryCircular':
      return (
        <Layout intent={ReloadWidgetIntent(null)}>
          <Text>出现错误</Text>
        </Layout>
      )
    case 'accessoryInline':
      return (
        <Layout intent={ReloadWidgetIntent(null)}>
          <Text lineLimit={1}>出现错误: {message}</Text>
        </Layout>
      )
    case 'accessoryRectangular':
      return (
        <Layout intent={ReloadWidgetIntent(null)}>
          <Text lineLimit={3} padding={5}>
            出现错误: {message}
          </Text>
        </Layout>
      )

    default:
      return <MainView type="info" iconName="x.circle" msg={`出现错误: ${message}`} />
  }
}

function AuthView({ id, name }: { id: number; name: string }) {
  switch (Widget.family) {
    case 'accessoryCircular':
      return (
        <Layout intent={AuthTunnelWidgetIntent(id)}>
          <Text lineLimit={2} padding={8} minScaleFactor={0.8}>
            {name}
          </Text>
        </Layout>
      )
    case 'accessoryInline':
      return (
        <Layout intent={AuthTunnelWidgetIntent(id)}>
          <Text lineLimit={1}>{name}</Text>
        </Layout>
      )
    case 'accessoryRectangular':
      return <MainView type="auth" id={id} name={name} showBottom={false} lineLimit={1} />

    default:
      return <MainView type="auth" id={id} name={name} />
  }
}

const getWidgetView = async () => {
  const token = Keychain.get('user_token')
  if (!token) return <LogoutView />

  if (!Widget.parameter) return <NoInputView />
  const id = Number(Widget.parameter)
  if (!Number.isInteger(id)) return <TunnelIDInvalidView />

  const result = await getTunnels(token)
  if ('error' in result) return <ErrorView message={result.error} />
  const tunnel = result.body.find((v) => v.id === id)
  if (tunnel) return <AuthView id={tunnel.id} name={tunnel.name} />
  else return <TunnelIDNotfoundView />
}

const main = async () => {
  const View = await getWidgetView()
  const WidgetView = () => View
  Widget.present(<WidgetView />)
}
main()
