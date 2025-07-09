import axios, { AxiosError, AxiosRequestConfig } from "axios";

export enum EApi {
    base = "https://uzfk.uz/uz/api"
}

interface IResponse {
    accessToken: string;
    refreshToken: string;
}

declare module 'axios' {
    export interface InternalAxiosRequestConfig {
        _isRetry?: boolean;
    }
}

const $api = axios.create({
    baseURL: EApi.base
});

$api.interceptors.request.use(config => {
    config.headers.Authorization = `Bearer ${localStorage.getItem("authToken")}`;
    return config;
});

$api.interceptors.response.use(config => {
    return config;
}, async (error: AxiosError) => {
    const originalRequest = error.config;
    if (error.response?.status == 401 && error.config && !error.config._isRetry) {
        originalRequest!._isRetry = true;
        try {
            const response = await axios.post<IResponse>(EApi.base + "/refresh", {
                refreshToken: localStorage.getItem("refresh")
            });
            localStorage.setItem("authToken", response.data.accessToken);
            localStorage.setItem("refresh", response.data.refreshToken);
            return $api.request(originalRequest as AxiosRequestConfig);
        } catch (e) {
            return e;
        }
    }
    throw error;
})

export default $api;