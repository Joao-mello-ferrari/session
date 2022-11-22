import { ReactNode } from "react";
import { useAllowed } from "../hooks/useAllowed";

interface AllowedProps{
  children: ReactNode;
  permissions?: [string] | [];
  roles?: [string] | [];
}

export function Allowed({ children, permissions=[], roles=[] }: AllowedProps){
  const userIsAllowedToSeeComponent = useAllowed({
    permissions,
    roles
  });

  if(!userIsAllowedToSeeComponent)
    return null
  
  return(
    <>
      { children }
    </>
  )
}