import Link from 'next/link';
import { gql, useQuery, useApolloClient } from '@apollo/client';
import React, { useState, useRef, useEffect } from 'react';
import Cookie from 'cookie';
import Collapse from '@mui/material/Collapse';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Container from '@mui/material/Container';
import Jwt from 'jsonwebtoken';

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
  const apolloClient = useApolloClient();
  const studioSectionRef = useRef();
  const [showAppError, setShowAppError] = useState(false);
  const [appError, setAppError] = useState('');
  const [currentMember, setSelectedMember] = useState(0);
  const [pageCover, setPageCover] = useState(0);
  const [typeOfServices, setTypeOfServices] = useState([]);
  const [user, setUser] = useState();
  const { loading, error, data } = useQuery(GET_HOMEPAGEDATA, {
    variables: {
      userRole: "stylist"
    },
    onCompleted: (data) => {
      if (data?.services) {
        let serviceType = [];

        data.services.forEach(service => {
          if (!serviceType.includes(service.type)) {
            serviceType.push(service.type)
          }
        });

        setTypeOfServices(serviceType);
      }
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

  useEffect(async () => {
    try {
      const cookies = Cookie.parse(document?.cookie ?? '');

      if (cookies?.error) {
        setAppError(cookies.error);
        setShowAppError(true);
      }

      const authToken = cookies.token;
      const payload = Jwt.decode(authToken);
  
      if (!payload || Date.now() > payload.exp * 1000) {
        throw new Error('Invalid token');
      }

      let userDetail = JSON.parse(localStorage.getItem("user"));

      if (!userDetail) {
        userDetail = await apolloClient.query({
          query: GET_USER,
          variables: {
            userId: payload?.id
          },
        });

        if (!userDetail) {
          throw new Error('Unable to verify user identity');
        }

        userDetail = userDetail.data.user;
        localStorage.setItem("user", JSON.stringify(userDetail));
      }

      setUser(userDetail);
    } catch(err) {
      return;
    }
  }, []);

  if (loading) return <Loading /> 
  if (error) {
    return <p>ERROR</p>
  }

  return (
    <Layout userDetail={user}>
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
      <Container maxWidth="xs" className={styles.error_alert}>
        <Collapse in={showAppError}>
          <Alert
            severity="error"
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setAppError('');
                  setShowAppError(false);
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{ mb: 2 }}
          >
            <AlertTitle>Error</AlertTitle>
            {appError}
          </Alert>
        </Collapse>
      </Container>  
    </Layout>
  )
}
