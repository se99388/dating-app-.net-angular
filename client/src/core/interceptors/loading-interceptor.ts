import { HttpEvent, HttpInterceptorFn, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { BusySerivce } from '../services/busy-serivce';
import { delay, finalize, identity, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

const cache = new Map<string, HttpEvent<unknown>>();

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const busyService = inject(BusySerivce);

  const generateCacheKey = (url: string, params: HttpParams) => {
    const paramString = params.keys().sort().map(key => `${key}=${params.get(key)}`).join('&');
    return paramString ? `${url}?${paramString}` : url;
  }

  const invalidateCache = (urlPatthern: string) => {
    for (const key of cache.keys()) {
      if (key.includes(urlPatthern)) {
        cache.delete(key);
        console.log(`Cache invalidated for key: ${key}`);
      }
    }
  }

  const cacheKey = generateCacheKey(req.url, req.params);

  if (req.method === 'POST' && req.url.includes('likes')) {
    invalidateCache('likes');
  }

  //should be change later
  if (req.method === 'POST') {
    console.log('Clearing entire cache on logout', req.url);
    cache.clear();
  }

  if (req.method === 'GET') {
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) return of(cachedResponse);

  }

  busyService.busy();

  return next(req).pipe(environment.production ? identity : delay(500),
    tap(response => {


      cache.set(cacheKey, response)
    }),
    finalize(() => {
      busyService.idle()
    }));
};
