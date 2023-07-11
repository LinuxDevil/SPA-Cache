/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
import axios, { AxiosInstance } from 'axios';

import HttpClient, { IRequestOption } from './IHttpClient';
import { responseTransformer, errorHandler } from './HttpTransformers.ts';

/**
 * Axios API client
 * @implements HttpClient
 * @see HttpClient
 * @summary It is used to make HTTP requests, it is asynchronous and uses promises.
 * @supported Supported browsers for Axios: https://github.com/axios/axios#browser-support
 */
class Axios implements HttpClient {
    axiosApi: AxiosInstance = axios.create();
    domain = new URL(location.href);
    defaultUrl = `${this.domain.origin}/api/v1/`;

    constructor(private cache: ICache<any>) {}

    public async request<Response>(option: IRequestOption): Promise<Response> {
        const crfToken = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
        const headers = {
            token: crfToken?.content || '',
            ...option.headers
        };

        const cacheKey = JSON.stringify({ url: this.defaultUrl + option.url, method: option.method, headers, data: option.body });

        const cachedResponse = await this.cache.get(cacheKey);
        if (cachedResponse !== null) {
            return cachedResponse;
        }

        return this.axiosApi({
            method: option.method,
            url: this.defaultUrl + option.url,
            data: option.body,
            headers
        })
            .then((response) => <Response>response)
            .then(async response => {
                await this.cache.set(cacheKey, response);
                return response;
            })
            .catch(errorHandler);
    }
}

export default Axios;
