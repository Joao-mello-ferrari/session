import { useContext } from "react";
import { AuthContext } from "../contexts/authContext";
import { validateUser } from "../utils/validateUser";

type UseAllowedProps = {
  permissions: [string] | [];
  roles: [string] | [];
}

export function useAllowed({ permissions=[], roles=[] }: UseAllowedProps){
  const { user, isLogged } = useContext(AuthContext);
  
  if(!isLogged || !user) 
    return false;
  
  const isUserValidated = validateUser({
    user,
    permissions,
    roles
  });

  return isUserValidated;
}