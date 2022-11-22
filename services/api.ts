import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie, destroyCookie } from 'nookies'
import Router from 'next/router'
import { AuthTokenError } from '../errors/authTokenError';
import { signOut } from '../contexts/authContext';

type AxiosResponse = {
  error: boolean;
  code: string;
  message: string;
}

type Request = {
  onSuccess: (token: string) => void;
  onFailure: (err: AxiosError) => void;
}

let isRefreshing = false;
let failedRequestsQueue: Request[] = [];

export function setAPIClient(context: any = undefined){
  let cookies = parseCookies(context);
  
  const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers:{
      Authorization: `Bearer ${cookies['nextauth.token']}`
    }
  })
  
  api.interceptors.response.use(
    response=>response, 
    (error: AxiosError<AxiosResponse>)=>{
  
    if(error.response?.status === 401){
      if(error.response?.data.code === 'token.expired'){
        cookies = parseCookies(context);
        const { 'nextauth.refreshToken': refreshToken } = cookies;
  
        let originalConfig = error.config;
  
        if(!isRefreshing){
          isRefreshing = true;
  
          api.post('/refresh', { refreshToken }).then(response=>{
            const { token, refreshToken: newRefreshToken } = response.data;
    
            setCookie(context, 'nextauth.token', token, {
              maxAge: 60 * 60 * 24 * 30,
              path: '/'
            });
            setCookie(context, 'nextauth.refreshToken', newRefreshToken, {
              maxAge: 60 * 60 * 24 * 30,
              path: '/'
            });
    
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
            failedRequestsQueue.forEach(request => request.onSuccess(token));
            failedRequestsQueue = [];
          }).catch(err=>{
            failedRequestsQueue.forEach(request => request.onFailure(err));
            failedRequestsQueue = [];
            
            if(process.browser)
              signOut();
            
          }).finally(()=>{
            isRefreshing = false;
          });
        }
        
        return new Promise((resolve, reject)=>{
          failedRequestsQueue.push({
            onSuccess: (token: string) => {
              if(originalConfig?.headers){
                originalConfig.headers['Authorization'] = `Bearer ${token}`;
                resolve(api(originalConfig));
              }
              reject(error);
            },
            onFailure: (err: AxiosError) => {
              reject(err)
            }
          })
        })
  
      }else{
        if(process.browser)
          signOut();
        else
          return Promise.reject(new AuthTokenError);
        
      }
    }
  
    return Promise.reject(error);
  });

  return api;
}

