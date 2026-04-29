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

type HttpMethod = (typeof Method)[keyof typeof Method]
const token = localStorage.getItem("token")

const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${token}`
} as const

function request<T>(
  fetchUrl: string,
  method: HttpMethod,
  payload?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  if (!token) {
    throw new Error("Unauthorized")
  }
  
  const payloadFields =
    method === Method.POST
      ? { data: payload }
      : { params: payload }

  return axios
    .request<T>({
      ...config,
      baseURL: baseURL || config?.baseURL,
      url: fetchUrl,
      method,
      ...payloadFields,
      headers,
    })
    .then((response) => response.data)
}

export const get = <T>(
  fetchUrl: string,
  params?: unknown,
  config?: AxiosRequestConfig,
) => request<T>(fetchUrl, Method.GET, params, config)

export const post = <T>(
  fetchUrl: string,
  data?: unknown,
  config?: AxiosRequestConfig,
) => request<T>(fetchUrl, Method.POST, data, config)

export const del = <T>(
  fetchUrl: string,
  params?: unknown,
  config?: AxiosRequestConfig,
) => request<T>(fetchUrl, Method.DELETE, params, config)

export const instance = {
  get,
  post,
  del,
}
