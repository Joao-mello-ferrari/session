import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { parseCookies, destroyCookie } from "nookies";
import { AuthTokenError } from "../errors/authTokenError";
import { validateUser } from "./validateUser";
import decode from 'jwt-decode';

type Options = {
  permissions: string[];
  roles: string[];
}

type DecodedUser = {
  permissions: string[];
  roles: string[];
}

type D = {
  [key: string]: any;
}

export function withSSRAuth<Q>(fn: GetServerSideProps, options: Options | null = null){
  return async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<Q|D>> => {
    const { 'nextauth.token': token } = parseCookies(context);
  
    if(!token){
      return{
        redirect:{
          destination: '/',
          permanent: false
        }
      }
    }

    if(options){
      const { permissions, roles } = options;
      const user = decode<DecodedUser>(token);

      const isUserValidated = validateUser({
        user,
        permissions,
        roles
      });

      if(!isUserValidated){
        return{
          redirect:{
            destination: '/dashboard',
            permanent: false
          }
        }
      }
    }

    try{
      return await fn(context);
    }catch(err){
      if(err instanceof AuthTokenError){
        destroyCookie(context, 'nextauth.token');
        destroyCookie(context, 'nextauth.refreshToken');

        return{
          redirect:{
            destination: '/',
            permanent: false
          }
        }
      }

      return{ props:{} }
    }

  }
}