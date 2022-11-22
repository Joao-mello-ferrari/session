import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/apiClient";
import { setCookie, parseCookies, destroyCookie } from 'nookies';
import Router from 'next/router';
import { v4 } from 'uuid';

type SignInCredentials = {
  email: string;
  password: string;
}

type AuthContextData = {
  isLogged: boolean;
  signIn(credentials: SignInCredentials): Promise<void>;
  signOut(shouldAllowBroadcast?: boolean): void;
  user: User | undefined;
}

type AuthProviderProps = {
  children: ReactNode;
}

type User = {
  email: string;
  permissions: string[];
  roles: string[];
}

let authChannel: BroadcastChannel;
const instanceId = v4();

export function signOut(shouldAllowBroadcast = true){
  destroyCookie(undefined, 'nextauth.token');
  destroyCookie(undefined, 'nextauth.refreshToken');

  if(shouldAllowBroadcast)
    authChannel.postMessage(`signOutß${instanceId}`);

  Router.push('/');
}

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps ){
  const [user, setUser] = useState<User>();

  useEffect(()=>{
    authChannel = new BroadcastChannel('signOut');
    authChannel.onmessage = (object) => {
      const [message,senderId,payload] = object.data.split('ß');

      if(senderId === instanceId) return;

      switch(message){
        case 'signOut':
          signOut(false);
          break;
        case 'signIn':
          const { 'nextauth.token': token } = parseCookies(undefined);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser(JSON.parse(payload));
          Router.push('/dashboard')
          break;
        default: 
          break;
      }
    }
  },[]);

  useEffect(()=>{
    const { 'nextauth.token': token } = parseCookies();

    if(token){
      api.get('/me').then(response=>{
        const { email, permissions, roles } = response.data;

        setUser({ email, permissions, roles })
      }).catch(()=>{
        if(typeof window !== undefined){
          destroyCookie(undefined, 'nextauth.token');
          destroyCookie(undefined, 'nextauth.refreshToken');

          Router.push('/')
        }
      });
    }
  },[]);

  const isLogged = !!user;
  
  async function signIn(credentials: SignInCredentials){
    try{
      const response = await api.post('/sessions', credentials);
      
      const { token, refreshToken, permissions, roles } = response.data;
      
      setCookie(undefined, 'nextauth.token', token, {
        maxAge: 60 * 60 * 24 * 30,
        path: '/'
      });
      setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30,
        path: '/'
      });
      
      const freshUser = {
        email: credentials.email,
        permissions,
        roles
      };

      setUser(freshUser);

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      authChannel.postMessage(`signInß${instanceId}ß${JSON.stringify(freshUser)}`);

      Router.push('/dashboard');
    } catch{

    }
  }

  return(
    <AuthContext.Provider value={{isLogged, signIn, signOut, user}}>
      {children}
    </AuthContext.Provider>
  )
}
