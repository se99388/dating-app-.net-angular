import { HttpEvent, HttpInterceptorFn, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { BusySerivce } from '../services/busy-serivce';
import { delay, finalize, of, tap } from 'rxjs';

const cache = new Map<string, HttpEvent<unknown>>();

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const busyService = inject(BusySerivce);

  const generateCacheKey = (url: string, params: HttpParams) => {
    const paramString = params.keys().sort().map(key => `${key}=${params.get(key)}`).join('&');
    return paramString ? `${url}?${paramString}` : url;
  }
  const cacheKey = generateCacheKey(req.url, req.params);

  if (req.method === 'GET') {
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) return of(cachedResponse);

  }

  busyService.busy();

  return next(req).pipe(delay(500),
    tap(response => {


      cache.set(cacheKey, response)
    }),
    finalize(() => {
      busyService.idle()
    }));
};
