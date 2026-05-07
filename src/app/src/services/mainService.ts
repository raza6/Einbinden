import axios, { AxiosRequestConfig } from 'axios';

enum EHttpVerb {
  GET, POST, PUT, DELETE
}

type ApiError<E = unknown> = { status: number | undefined; body: E };
type ApiResult<T, E = unknown> = { data: T; error: null } | { data: null; error: ApiError<E> };

class MainService {
  public static async handleApiCall<D = any>(verb: EHttpVerb, url: string, data: D | null = null, conf: AxiosRequestConfig<any> | undefined = undefined) {
    let res;
    const logCong = {
      withCredentials: true,
      headers: { 'Access-Control-Allow-Credentials': true },
      ...conf
    };
    try {
      let axiosResponse;
      switch (verb) {
      case EHttpVerb.GET:
        axiosResponse = await axios.get(url, logCong);
        break;
      case EHttpVerb.POST:
        axiosResponse = await axios.post(url, data, logCong);
        break;
      case EHttpVerb.PUT:
        axiosResponse = await axios.put(url, data, logCong);
        break;
      case EHttpVerb.DELETE:
        axiosResponse = await axios.delete(url, logCong);
        break;
      }
      res = axiosResponse.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status !== 401) {
          console.error('😰 - Network error', error.response?.status, error.toJSON());
        }
        res = null;
      } else {
        throw error;
      }
    }
    return res;
  }

  public static async handleApiCallWithError<T = any, E = unknown, D = any>(verb: EHttpVerb, url: string, data: D | null = null, conf: AxiosRequestConfig<any> | undefined = undefined): Promise<ApiResult<T, E>> {
    const logCong = {
      withCredentials: true,
      headers: { 'Access-Control-Allow-Credentials': true },
      ...conf
    };
    try {
      let axiosResponse;
      switch (verb) {
      case EHttpVerb.GET:
        axiosResponse = await axios.get<T>(url, logCong);
        break;
      case EHttpVerb.POST:
        axiosResponse = await axios.post<T>(url, data, logCong);
        break;
      case EHttpVerb.PUT:
        axiosResponse = await axios.put<T>(url, data, logCong);
        break;
      case EHttpVerb.DELETE:
        axiosResponse = await axios.delete<T>(url, logCong);
        break;
      }
      return { data: axiosResponse.data, error: null };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status !== 401) {
          console.error('😰 - Network error', error.response?.status, error.toJSON());
        }
        return { data: null, error: { status: error.response?.status, body: error.response?.data as E } };
      }
      throw error;
    }
  }
}

export { MainService, EHttpVerb };
export type { ApiResult, ApiError };
