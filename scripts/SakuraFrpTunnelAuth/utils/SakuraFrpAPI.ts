import { fetch, Headers } from 'scripting'

const BASE_URL = 'https://api.natfrp.com/v4'

type FetchAPIOptions = {
  body?: Record<string, unknown>
  responseType?: 'text' | 'json'
}
type FetchAPIResult<T> =
  | {
      error: string
    }
  | { body: T }
const fetchAPI = async <T = unknown>(
  token: string,
  method: string,
  pathname: string,
  { body, responseType }: FetchAPIOptions = {},
): Promise<FetchAPIResult<T>> => {
  if (!responseType) responseType = 'json'

  try {
    const headers = new Headers({
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    })
    if (body) headers.set('Content-Type', 'application/json')

    const resp = await fetch(BASE_URL + pathname, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    let resp_text: string | undefined
    try {
      resp_text = await resp.text()
    } catch {
      resp_text = undefined
    }
    let resp_json: Record<string, unknown> | undefined
    try {
      resp_json = resp_text ? JSON.parse(resp_text) : undefined
    } catch {
      resp_json = undefined
    }

    if (!resp.ok) {
      let error: string | undefined = undefined
      if (resp_json && resp_json.code && resp_json.msg)
        error = `${resp_json.code}: ${resp_json.msg}`
      return {
        error: error ?? `FetchFail: ${resp.status}: ${resp.statusText}`,
      }
    }

    if (responseType === 'text' && resp_text)
      return {
        body: resp_text as T,
      }
    else if (responseType === 'json' && resp_json)
      return {
        body: resp_json as T,
      }
    else {
      return {
        error: 'Response Body Empty',
      }
    }
  } catch (e) {
    return {
      error: 'UnknownError: ' + String(e),
    }
  }
}

export type UserInfo = {
  id: number
  name: string
  avatar: string
}
export const getUserInfo = async (token: string): Promise<FetchAPIResult<UserInfo>> => {
  return await fetchAPI<UserInfo>(token, 'GET', '/user/info', {
    responseType: 'json',
  })
}

type TunnelType = 'tcp' | 'udp' | 'http' | 'https' | 'wol' | 'etcp' | 'eudp'
export type TunnelInfo = {
  id: number
  name: string
  type: TunnelType
  online: boolean
  note: string
  extra: string
}
export const getTunnels = async (token: string): Promise<FetchAPIResult<TunnelInfo[]>> => {
  return await fetchAPI<TunnelInfo[]>(token, 'GET', '/tunnels', {
    responseType: 'json',
  })
}

export const tunnelAuth = async (
  token: string,
  id: number,
  ip?: string,
): Promise<FetchAPIResult<string>> => {
  return await fetchAPI<string>(token, 'POST', '/tunnel/auth', {
    body: { id, ip },
    responseType: 'text',
  })
}

export const getIP = async (): Promise<FetchAPIResult<string>> => {
  try {
    const resp = await fetch('https://ip4.13a.com/')
    if (!resp.ok)
      return {
        error: `getIP:FetchFail: ${resp.status}:${resp.statusText}`,
      }
    const resp_text = await resp.text()
    return {
      body: resp_text,
    }
  } catch (e) {
    return {
      error: 'getIP:UnknownError: ' + String(e),
    }
  }
}
