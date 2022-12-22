import { useState, useEffect } from 'react';
import axios from "axios";
import styled from 'styled-components';

import { useAuthState } from "../../context/AuthHooks";
import { historyProps, UserProps } from "./UserProps";
import MatchingHistory from "./MatchingHistory";
import LoadingPage from "../../LoadingPage";
import UserStats from './UserStats';
import { Url } from '../../constants/Global';
import UserName from './UserName';
import UserImage from './UserImage';
import UserTfa from './UserTfa';
import { useParams } from 'react-router-dom';

const Layout = styled.div`
  min-height: 100vh;
  justify-content: center;
  background-image: url("/src/images/background.jpg");
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 60px;
  padding: 2em;
  justify-content: center;
  align-items: center;
	font-family:SBAggroL;
  background: rgba(0, 0, 0, 0);
`;

const UserProfile = styled.div`
  margin: 2em;
  max-width: 80vw;
  display: grid;
  grid-template-columns: 1fr 2fr;
  grid-template-rows: 1fr 1fr;
  grid-template-areas:
  "image name"
  "image stats";
  & > * {
    display: flex;
    white-space: pre-line;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0);
    font-fami
`

const UserHistory = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2em;
  background: rgba(0, 0, 0, 0);
`;

const Profile = () => {
  const pathVar = useParams();
  const intra = pathVar ? pathVar.intra : "";
  
  const [userData, setUserData] = useState<UserProps>();
  const { token } = useAuthState();
  
  const getData = async() => {
    await axios.get(Url + 'user/profile/' + (intra === undefined || intra === "" ? "" : intra), {
      headers: {
        Authorization:"Bearer " + token
      }
    }).then(response => {
      const data: UserProps = response.data;
      setUserData(
        prev => prev = new UserProps(
          data.intra_id,
          data.nickname,
          data.profile_url,
          data.two_factor,
          data.stats,
          data.matching_history));
          console.log(data);
    }).catch(error => {
      console.error('user profile loading failed');
      setUserData(DummyUserData);
    });
  }

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    getData();
  }, [pathVar]);

  if (userData === undefined) {
    return (
      <LoadingPage />
    );
  }

  return (
    <Layout>
      <Wrapper>
        <UserProfile>
          <UserImage profile_url={userData.profile_url} user={userData.intra_id}/>
          <UserName name={userData.nickname} user={userData.intra_id}>
            <UserTfa isTfaOn={userData.two_factor} user={userData.intra_id}/>
          </UserName>
          <UserStats stats={userData.stats}/>
        </UserProfile>
        <UserHistory>
          {userData.matching_history.length !== 0 ?
            (userData.matching_history.map((item: historyProps, index) => (
              <MatchingHistory
                key={index}
                name={userData.nickname}
                image={userData.profile_url}
                history={item} />
            ))) : <div>아직 한번도 플레이 하지 않았어요ㅠㅠ</div>
          }
        </UserHistory>
      </Wrapper>
    </Layout>
  );
}

export default Profile;
