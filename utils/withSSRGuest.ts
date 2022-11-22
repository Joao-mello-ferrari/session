import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { parseCookies } from "nookies";

type D = {
  [key: string]: any;
}

export function withSSRGuest<Q>(fn: GetServerSideProps){
  return async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<Q|D>> => {
    const { 'nextauth.token': token } = parseCookies(context);
  
    if(token){
      return{
        redirect:{
          destination: '/dashboard',
          permanent: false
        }
      }
    }

    return await fn(context);
  }
}