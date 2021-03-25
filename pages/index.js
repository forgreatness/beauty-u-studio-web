import Head from 'next/head';
import Link from 'next/link';
import { gql, useQuery } from '@apollo/client';

import Layout from '../components/page-layout';
import styles from '../styles/homepage.module.css';
import * as Constants from '../src/constants/index';
import ServiceCard from '../components/service-card';
import Loading from '../components/loading';
import { GET_SERVICES } from '../lib/apollo/data-queries';


//TODO:
//3. COMMIT the source code to azure
//4. DEPLOY to azure
//5. UPDATE RESUME
export default function Home() {  
  const { loading, error, data } = useQuery(GET_SERVICES);
  var typeOfServices = [];

  if (loading) return <Loading /> 
  if (error) {
    return <p>ERROR</p>
  }

  data.services.forEach(service => {
    if (!typeOfServices.includes(service.type)) {
      typeOfServices.push(service.type)
    }
  });

  return (
    <Layout>
      <img className={styles.homepage_cover} alt="BeautyUStudio Home Page cover" src="images/homepage-cover.jpg"/>
      <div className={styles.vision_container}>
        <h3>OUR VISION</h3>
        <p>{Constants.OUR_MISSION}</p>
      </div>
      <div className={styles.service_container}>
        <h3>SERVICES</h3>
        <div className={styles.services_flexbox}>
          {typeOfServices.map(service => {
            return (
              <Link key={service} href={`/services/${service.toLowerCase()}`} passHref>
                <a>
                  <ServiceCard serviceType={service.toUpperCase()} />
                </a>
              </Link>
            );
          })}
        </div>
      </div>
    </Layout>
  )
}
