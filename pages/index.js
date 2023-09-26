import Link from 'next/link';
import { useRouter } from 'next/router';
import { gql, useQuery, useApolloClient } from '@apollo/client';
import React, { useState, useRef, useEffect } from 'react';
import Cookie from 'cookie';
import Collapse from '@mui/material/Collapse';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Container from '@mui/material/Container';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Jwt from 'jsonwebtoken';

import Layout from '../components/page-layout';
import styles from '../styles/homepage.module.css';
import * as Constants from '../src/constants/index';
import ServiceCard from '../components/service-card';
import MemberSelector from '../components/member_selector';
import Loading from '../components/loading';
import ClientReview from '../components/client_review';
import CustomButton from '../components/custom_button';
import ApolloClient from '../lib/apollo/apollo-client';
import PromotionBanner from '../components/promotion_banner';
import SplatterButton from '../components/splatter_button';
import { GET_HOMEPAGEDATA, GET_PROMOTIONS } from '../lib/apollo/data-queries';

export default function Home({ featuredPromotions }) {
  const router = useRouter();
  const apolloClient = useApolloClient();
  const studioSectionRef = useRef();
  const [showAppError, setShowAppError] = useState(false);
  const [appError, setAppError] = useState('');
  const [currentMember, setSelectedMember] = useState(0);
  const [pageCover, setPageCover] = useState(0);
  const [typeOfServices, setTypeOfServices] = useState([]);
  const [user, setUser] = useState();
  const [onLoading, setOnLoading] = useState(false);
  const [onLoadingNotification, setOnLoadingNotificaiton] = useState("");
  const [featuredPromotionsDetails, setFeaturedPromotionsDetails] = useState([]);
  const [featuredPromotion, setFeaturedPromotion] = useState(featuredPromotions?.[0]?.id);
  const { loading, error, data } = useQuery(GET_HOMEPAGEDATA, {
    variables: {
      userRole: "stylist"
    },
    onCompleted: (data) => {
      if (data?.services) {
        let serviceType = [];

        data.services.filter(service => service.status == "active").forEach(service => {
          if (!serviceType.includes(service.type)) {
            serviceType.push(service.type)
          }
        });

        setTypeOfServices(serviceType);

        featuredPromotions.forEach(promotion => {
          promotion.services = promotion.services.map(serviceId => {
            const service = data.services.find(service => service.id.toString() == serviceId.toString());

            return service;
          }).filter(service => (service));
        });
      } else {
        featuredPromotions.forEach(promotion => promotion.services = []);
      }

      setFeaturedPromotionsDetails(featuredPromotions);
      console.log(featuredPromotions);
    },
    onError: () => {
      featuredPromotions.forEach(promotion => promotion.services = []);
      setFeaturedPromotionsDetails(featuredPromotions);
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
    e.preventDefault();

    const selected_member_id = e.target.id;

    data.stylists.forEach((stylist, i) => {
      if (stylist.id.toString() == selected_member_id) {
        setSelectedMember(i);
      }
    });
  }

  const handleFeaturedPromotionChange = (e) => {
    e.preventDefault();

    featuredPromotionsDetails.forEach(promotion => {
      if (promotion.id.toString() == e.target.id) {
        setFeaturedPromotion(e.target.id);
      }
    })
  }

  const handleNavigation = (path) => {
    setOnLoading(true);
    if (router.pathname == path) {
        router.reload();
    } else {
        router.push(path);
    }
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
            <Link href="/about" passHref legacyBehavior>
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
              (<Link
                key={service}
                href={`/services/${service.toLowerCase()}`}
                passHref
                className={styles.service_card}>

                <ServiceCard serviceType={service.toUpperCase()} />

              </Link>)
            );
          })}
        </div>
      </div>
      <div className={`container-fluid`}>
        <div className={`row ${styles.team_section}`}>
          <div className={`col-md-4 ${styles.team_section_header} align-self-center`}>
            <h3>OUR TEAM</h3>
            <div className={styles.member_selectors}>
              {data.stylists.map((stylist, i) => 
                [
                  <MemberSelector key={stylist.id.toString()} memberId={stylist.id.toString()} selected={i==currentMember} onSelectMemberSelector={handleSelectMember}/>,
                ]
              )}
            </div>
          </div>
          <div className={`col-md-8`}>
            <div className={`${styles.team_card} row align-items-center`}>
              <img className='col-sm-4' alt="Image of Team Member" src={"data:image/png;base64, " + data.stylists[currentMember].photo} />
              <div className={`${styles.member_info} col-sm-8`}>
                <b className={styles.name}>{data.stylists[currentMember].name}</b>
                <p className={styles.about}>{data.stylists[currentMember].about}</p>
                <SplatterButton className={styles.scheduleAppointmentButton} onButtonClick={() => handleNavigation("/appointment")}>Book Appointment</SplatterButton>
              </div>
            </div>
          </div>
        </div>
      </div>
      {featuredPromotionsDetails.length > 0 ?
        <div id={styles.promotion_banner}>
          <PromotionBanner promotion={featuredPromotionsDetails?.[featuredPromotionsDetails.findIndex(promotion => promotion.id == featuredPromotion)]} />
          <div id={styles.promotion_selector}>
            {(featuredPromotionsDetails ?? []).map(promotion => {
              return (
                <MemberSelector className={styles.selector} key={promotion.id.toString()} memberId={promotion.id.toString()} selected={promotion.id.toString()==featuredPromotion} onSelectMemberSelector={handleFeaturedPromotionChange}/>
              );
            })}
          </div>
        </div> : null
      }
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={onLoading}>
        <CircularProgress color="inherit" />
        <span>&nbsp;{onLoadingNotification}</span> 
      </Backdrop>
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
  );
}

export async function getServerSideProps() {
  try {
    const getPromotions = await ApolloClient.query({
      query: GET_PROMOTIONS,
      fetchPolicy: "no-cache"
    });
  
    const promotions = getPromotions?.data?.promotions;
  
    if (!promotions) {
      throw new Error('Unable to fetch promotions');
    }

    const featuredPromotions = promotions.filter(promotion => {
      const promotionStartDate = new Date(promotion?.start);
      const promotionEndDate = new Date(promotion?.end);

      if (promotionStartDate <= Date.now() && promotionEndDate >= Date.now()) {
        return true;
      }

      return false;
    });

    return {
      props: {
        featuredPromotions: featuredPromotions
      }
    }
  } catch (err) {
    console.log(err);
  }
}
