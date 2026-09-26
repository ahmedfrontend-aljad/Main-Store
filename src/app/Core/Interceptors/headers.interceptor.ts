import { HttpInterceptorFn } from '@angular/common/http';

export const headersInterceptor: HttpInterceptorFn = (req, next) => {
  const userToken = localStorage.getItem('userToken');
  const guestToken = localStorage.getItem('guestToken');

  const token = userToken ?? guestToken;

  if (token && token !== 'null' && token !== 'undefined') {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req);
};
