import Link from 'next/link';
import { gql, useQuery } from '@apollo/client';
import React, { useState } from 'react';

import Layout from '../components/page-layout';
import styles from '../styles/homepage.module.css';
import * as Constants from '../src/constants/index';
import ServiceCard from '../components/service-card';
import Loading from '../components/loading';
import { GET_SERVICES } from '../lib/apollo/data-queries';

export default function Home() {
  const [pageCover, setPageCover] = useState(0);
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

  const handleNextArrow = (e) => {
    e.preventDefault();

    if (pageCover < Constants.HOMEPAGE_COVER.length-1) {
      setPageCover(pageCover => pageCover + 1);
    }
  }

  const handlePrevArrow = (e) => {
    e.preventDefault();

    if (pageCover > 0) {
      setPageCover(pageCover => pageCover - 1);
    }
  }

  return (
    <Layout>
      <div className={styles.homepage_cover}>
        <img alt="Image of BeautyUStudio clients and services" src={Constants.HOMEPAGE_COVER[pageCover]} />
        <div className={`${styles.arrow} ${styles.prev}`} onClick={handlePrevArrow}>
          <div className={styles.arrow_begin}></div>
          <div className={styles.arrow_end}></div>
        </div>
        <div className={`${styles.arrow} ${styles.next}`} onClick={handleNextArrow}>
          <div className={styles.arrow_begin}></div>
          <div className={styles.arrow_end}></div>
        </div>
        <div className={`${styles.arrow} ${styles.more}`}>
          <div className={styles.arrow_begin}></div>
          <div className={styles.arrow_end}></div>
        </div>
      </div>
      <div className={styles.studio_section}>
        <div className={`${styles.child} ${styles.description_section}`}>
          <h3>OUR STUDIO</h3>
          <div className={styles.description}>
            <p>{Constants.OUR_VISION}</p>
            <Link href="/about" passHref>
              <a className={styles.learnmore_link}>Learn More</a>
            </Link>
          </div>
        </div>
        <img alt="Image of BeautyUStudio shop" src={Constants.STUDIO_COVER} className={styles.child}/>
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