/**
 * IRequestOption
 * @interface
 * @summary It defines the options for the request.
 * @usedBy IHttpClient, Fetch and MockHttpClient (for testing)
 * @property {string} url - the url of the request
 * @property {string} method - the method of the request
 * @property {object} headers - the headers of the request
 * @property {object} body - the body of the request
 */
export interface IRequestOption {
    readonly method?: 'GET' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'POST' | 'PUT' | 'PATCH';
    readonly url?: string;
    readonly headers?: any;
    readonly body?: any;
  }
  
  /**
   * IHttpClient
   * @interface
   * @summary independent interface to form a universal way of requesting.
   */
  interface HttpClient {
    request<Response>(requestOption: IRequestOption): Promise<Response>;
  }
  
  export default HttpClient;
  