"use client"

import axios, { AxiosRequestConfig } from "axios"

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? ""

const Method = {
  GET: "GET",
  POST: "POST",
  DELETE: "DELETE",
} as const

export interface ResponseType<T> {
  code: number
  message: string
  data: T
}

export function unwarpResponse<T>(response: ResponseType<T>) {
  if (response.code !== 200) {
    // 返回的错误信息
    console.error(response.message)
    throw new Error(response.message)
  }
  return response.data
}

type HttpMethod = (typeof Method)[keyof typeof Method]

/** 保留 `skipAuth` 兼容旧调用；当前鉴权由 HttpOnly Cookie 在服务端完成。 */
export type HttpRequestConfig = AxiosRequestConfig & { skipAuth?: boolean }

function request<T>(
  fetchUrl: string,
  method: HttpMethod,
  payload?: unknown,
  config?: HttpRequestConfig,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  const payloadFields =
    method === Method.POST
      ? { data: payload }
      : { params: payload }

  const axiosConfig = { ...(config ?? {}) } as HttpRequestConfig
  delete axiosConfig.skipAuth

  return axios
    .request<T>({
      ...axiosConfig,
      baseURL: baseURL || axiosConfig.baseURL,
      url: fetchUrl,
      method,
      ...payloadFields,
      withCredentials: true,
      validateStatus: axiosConfig.validateStatus ?? (() => true),
      headers: { ...headers, ...axiosConfig.headers },
    })
    .then((response) => response.data)
}

export const get = <T>(
  fetchUrl: string,
  params?: unknown,
  config?: HttpRequestConfig,
) => request<T>(fetchUrl, Method.GET, params, config)

export const post = <T>(
  fetchUrl: string,
  data?: unknown,
  config?: HttpRequestConfig,
) => request<T>(fetchUrl, Method.POST, data, config)

export const del = <T>(
  fetchUrl: string,
  params?: unknown,
  config?: HttpRequestConfig,
) => request<T>(fetchUrl, Method.DELETE, params, config)

export const instance = {
  get,
  post,
  del,
}
