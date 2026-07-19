import {
  Button,
  List,
  Navigation,
  NavigationStack,
  Section,
  SecureField,
  useCallback,
  useState,
} from 'scripting'

export default function LoginView({ success }: { success?: (token: string) => void }) {
  const [token, setToken] = useState<string>('')
  const dismiss = Navigation.useDismiss()

  const onDone = useCallback(async () => {
    if (!token || token.trim() === '') {
      await Dialog.alert({
        title: '登陆失败',
        message: '访问密钥不能为空',
      })
      return
    }
    const result = Keychain.set('user_token', token, {
      accessibility: 'first_unlock_this_device',
      synchronizable: false,
    })
    if (!result) {
      await Dialog.alert({
        title: '登陆失败',
        message: '保存访问密钥失败',
      })
      return
    }
    success?.(token)
    dismiss()
  }, [token])

  return (
    <NavigationStack>
      <List navigationTitle="登陆" navigationBarTitleDisplayMode={'inline'}>
        <Section>
          <SecureField
            title="访问密钥"
            autofocus
            value={token}
            onChanged={setToken}
            prompt="请输入访问密钥"
          />
          <Button title="确认" action={onDone} />
        </Section>
      </List>
    </NavigationStack>
  )
}
