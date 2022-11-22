import { GetServerSideProps } from 'next';
import { FormEvent, useContext, useState } from 'react';
import { AuthContext } from '../contexts/authContext';
import { withSSRGuest } from '../utils/withSSRGuest';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { signIn } = useContext(AuthContext);

  function handleSubmit(e: FormEvent){
    e.preventDefault();
    signIn({email, password});
  }

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <input className={styles.input} type="email" onChange={e=>setEmail(e.target.value)} value={email}/>
      <input className={styles.input} type="text" onChange={e=>setPassword(e.target.value)} value={password}/>
      <button className={styles.button} type="submit">Entrar</button>
    </form>
  )
}

export const getServerSideProps = withSSRGuest(async (context) => {
  return{ props:{ } }
})


