type User = {
  permissions: string[];
  roles: string[];
}

type ValidadeUserProps = {
  user: User;
  permissions?: string[];
  roles?: string[];
}

export function validateUser({
  user,
  permissions=[],
  roles=[]
}: ValidadeUserProps){

  if(user.permissions?.length > 0){
    const hasAllPermissions = permissions.every((permission)=>{
      return user.permissions.includes(permission);
    });
    
    if(!hasAllPermissions && permissions.length > 0)
      return false
  }

  if(user.roles?.length > 0){
    const hasAnyRole = roles.some((role)=>{
      return user.roles.includes(role);
    });

    if(!hasAnyRole && roles.length > 0)
      return false
  }

  return true;
}