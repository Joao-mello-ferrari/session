import { useContext } from "react"
import { AuthContext } from "../contexts/authContext"
import { withSSRAuth } from "../utils/withSSRAuth";
import { setAPIClient } from '../services/api';
import { Allowed } from "../components/Allowed";

export default function Dashboard(){
  const { user, signOut } = useContext(AuthContext);

  return(
    <>
      <h1>Dashboard = {user?.email}</h1>

      <Allowed>
        <span>Metrics</span>
      </Allowed>

      <button onClick={()=>signOut()}>
        Sair
      </button>
    </>
  )
}

export const getServerSideProps = withSSRAuth(async(context) =>{
  const api = setAPIClient(context);
  await api.get('/me');

  return{ props: {} }
});