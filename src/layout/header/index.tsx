import { useEffect, useState } from "react";
import styled from "styled-components";
import ProfileButton from "./ProfileButton";
import LogoButton from "./LogoButton";
import FriendsButton from "./FriendsButton";
import MatchingWaitBall from "../../components/MatchingWaitBall";
import { useQueueDispatch, useQueueState } from "../../context/QueueHooks";
import MatchingModal from "../../components/modals/MatchingModal";

const HeadBar = styled.div`
  z-index: 8;
  position: fixed;
  width: 100%;
  height: 60px;
  top: 0;
  left: 0;
  background: var(--dark-gray);
  font-family: SBAggroM;
  font-size: 24px;
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
`;

const Header = () => {
  const [toggle, setToggle] = useState(false);
  const [matchingBall, setMatchingBall] = useState(false);
  const [matchingModal, setMatchingModal] = useState(false);
  const queueState = useQueueState();
  const queueDispatch = useQueueDispatch();

  useEffect(()=>{
    if (queueState.queue_state === "NONE")
      setMatchingBall(false);
    else if (queueState.queue_state === "MATCHED") {
      setMatchingBall(false);
      setMatchingModal(true);
    }
    else if (queueState.queue_state === "INGAME")
      setMatchingBall(false);
    else
      setMatchingBall(true);
  },[queueState]);

  const matchingBallCancel = () => {
    setMatchingBall(false);
    queueDispatch({type:"NONE"});
  }

  const matchingModalCancel = () => {
    setMatchingModal(false);
    queueDispatch({type:"NONE"});
  }
  
  return (
    <HeadBar>
      <div>
        <ProfileButton />
      </div>
      <div>
        <LogoButton />
      </div>
      <div>
        <FriendsButton toggle={toggle} setToggle={setToggle} />
      </div>
      {matchingBall &&
        <MatchingWaitBall handler={matchingBallCancel}/>
      }
      {matchingModal &&
        <MatchingModal modalHandler={matchingModalCancel} />
      }
    </HeadBar>
  );
};

export default Header;
