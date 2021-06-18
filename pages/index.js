import Link from 'next/link';
import { gql, useQuery } from '@apollo/client';
import React, { useState, useRef } from 'react';

import Layout from '../components/page-layout';
import styles from '../styles/homepage.module.css';
import * as Constants from '../src/constants/index';
import ServiceCard from '../components/service-card';
import MemberSelector from '../components/member_selector';
import Loading from '../components/loading';
import ClientReview from '../components/client_review';
import CustomButton from '../components/custom_button';
import { GET_SERVICES, GET_USERS, GET_HOMEPAGEDATA } from '../lib/apollo/data-queries';

export default function Home() {
  const studioSectionRef = useRef();
  const [currentMember, setSelectedMember] = useState(0);
  const [pageCover, setPageCover] = useState(0);
  const { loading, error, data } = useQuery(GET_HOMEPAGEDATA, {
    variables: {
      userRole: "stylist"
    }
  });
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

  const handleMoreContentArrow = (e) => {
    studioSectionRef.current.scrollIntoView({ behavior: 'smooth' });
  }

  const handleSelectMember = (e) => {
    e.preventDefault;

    const selected_member_name = e.target.id;

    data.stylists.forEach((stylist, i) => {
      if (stylist.name == selected_member_name) {
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
        <div className={`${styles.arrow} ${styles.more}`} onClick={handleMoreContentArrow}>
          <div className={styles.arrow_begin}></div>
          <div className={styles.arrow_end}></div>
        </div>
      </div>
      <div ref={studioSectionRef} className={styles.studio_section}>
        <div className={`${styles.child} ${styles.description_section}`}>
          <h3>OUR STUDIO</h3>
          <div className={styles.description}>
            <p>{Constants.OUR_VISION}</p>
            <Link href="/about" passHref>
              <CustomButton>Learn More</CustomButton>
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
                <a className={styles.service_card}>
                  <ServiceCard serviceType={service.toUpperCase()} />
                </a>
              </Link>
            );
          })}
        </div>
      </div>
      <div className={styles.team_section}>
        <div className={styles.team_section_header}>
          <h3>OUR TEAM</h3>
          <div className={styles.member_selectors}>
            {data.stylists.map((stylist, i) => 
              [
                <MemberSelector key={stylist.name} member={stylist} selected={i==currentMember} onSelectMemberSelector={handleSelectMember}/>,
              ]
            )}
          </div>
        </div>
        <div className={styles.team_card}>
          <img alt="Image of Team Member" src={"data:image/png;base64, " + data.stylists[currentMember].photo} />
          <div className={styles.member_info}>
            <b>{data.stylists[currentMember].name}</b>
            <p>{data.stylists[currentMember].about}</p>
            <button>BOOK APPOINTMENT</button>
          </div>
        </div>
      </div>
      <div className={styles.client_reviews_section}>
        <h3>CLIENT REVIEWS</h3>
        <div className={styles.reviews}>
          {Constants.REVIEWS.map((review, i) => 
            [
              <ClientReview key={review.id} review={review} className={styles.review}/>
            ]
          )}
        </div>
      </div>
    </Layout>
  )
}
