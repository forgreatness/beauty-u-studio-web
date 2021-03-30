import Link from 'next/link';
import { gql, useQuery } from '@apollo/client';
import React, { useState } from 'react';

import Layout from '../components/page-layout';
import styles from '../styles/homepage.module.css';
import * as Constants from '../src/constants/index';
import ServiceCard from '../components/service-card';
import MemberSelector from '../components/member_selector';
import Loading from '../components/loading';
import { GET_SERVICES } from '../lib/apollo/data-queries';

export default function Home() {
  const [cuurentMember, setSelectedMember] = useState(0);
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

  const handleSelectMember = (e) => {
    e.preventDefault;

    const selected_member_name = e.target.id;

    Constants.TEAM_MEMBER.forEach((member, i) => {
      if (member.name == selected_member_name) {
        setSelectedMember(i);
      }
    });
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
      <div className={styles.service_section}>
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
      <div className={styles.team_section}>
          <div>
            {Constants.TEAM_MEMBER.map((member, i) => 
              [
                <MemberSelector member={member} selected={i==cuurentMember} onSelectMemberSelector={handleSelectMember}/>,
              ]
            )}
          </div>
          <h3>OUR TEAM</h3>
          <div className={styles.team_card}>
            <img alt="Image of Team Member" src={Constants.TEAM_MEMBER[cuurentMember].photo}/>
            <div className={styles.member_info}>
              <b>{Constants.TEAM_MEMBER[cuurentMember].name}</b>
              <p>{Constants.TEAM_MEMBER[cuurentMember].about}</p>
              <button>BOOK APOINTMENT</button>
            </div>
          </div>
      </div>
    </Layout>
  )
}