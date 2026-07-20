import { Button, HStack, Image, Rectangle, Spacer, Text, VStack, Widget, ZStack } from 'scripting'
import { AuthTunnelWidgetIntent, ReloadWidgetIntent } from './app_intents'
import { getTunnels } from './utils/SakuraFrpAPI'

type MainViewParams =
  | {
      type: 'info'
      iconName: string
      msg: string
    }
  | {
      type: 'auth'
      id: number
      name: string
    }
function MainView(params: MainViewParams) {
  return (
    <ZStack>
      {params.type === 'auth' && (
        <Button buttonStyle="plain" intent={AuthTunnelWidgetIntent(params.id)}>
          <Rectangle
            frame={{
              maxWidth: 'infinity',
              maxHeight: 'infinity',
            }}
            contentShape="rect"
            fill="clear"
          />
        </Button>
      )}
      <VStack spacing={0}>
        <VStack
          alignment="leading"
          spacing={0}
          padding={{
            top: 12,
            horizontal: 12,
            bottom: params.type === 'auth' ? undefined : 12,
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
              lineLimit={4}
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
        {params.type === 'auth' && (
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
    </ZStack>
  )
}

const getWidgetView = async () => {
  const token = Keychain.get('user_token')
  if (!token) return <MainView type="info" iconName="x.circle" msg="未登录" />

  if (!Widget.parameter) return <MainView type="info" iconName="x.circle" msg="未输入隧道ID" />
  const id = Number(Widget.parameter)
  if (!Number.isInteger(id)) return <MainView type="info" iconName="x.circle" msg="非法隧道ID" />

  const result = await getTunnels(token)
  if ('error' in result)
    return <MainView type="info" iconName="x.circle" msg={`出现错误: ${result.error}`} />
  const tunnel = result.body.find((v) => v.id === id)
  if (tunnel) return <MainView type="auth" id={tunnel.id} name={tunnel.name} />
  else return <MainView type="info" iconName="x.circle" msg="隧道未找到" />
}

const main = async () => {
  const View = await getWidgetView()
  const WidgetView = () => View
  Widget.present(<WidgetView />)
}
main()
