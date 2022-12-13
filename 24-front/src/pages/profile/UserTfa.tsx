import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { Url } from "../../constants/Global";
import { useAuthState } from "../../context/AuthHooks";

const Wrapper = styled.div`
	display: flex;
`;

const Button = styled.button`
	padding: 0.5rem;
	font-size: 2rem;
	border: none;
  background: rgba(0, 0, 0, 0);
`;

const MessageWrapper = styled.div`
  position: relative;
  width: 20%;
`;

const Message = styled.div`
  padding: 0.8em;
  position: fixed;
  font-size: 0.8rem;
  line-height: 0.8rem;
  font-family: NanumSquareL;
  background: var(--translucent-white);
`

const UserTfa = ({isTfaOn, user} : {isTfaOn : boolean, user: string}) => {
  const [tfa, setTfa] = useState(isTfaOn);
	const [hover, setHover] = useState(false);
  const {pathVar} = useParams();
  const { token, intra } = useAuthState();

  useEffect(() => {
    setTfa(isTfaOn);
  }, [isTfaOn])

  const onClickTfa = async () => {
    await axios.put(Url + 'user/profile', {
        two_auth: !tfa
    }, {
          headers: {
            Authorization:"Bearer " + token
          }
    }).then(response => {
      console.log("set tfa: " + response.status);
			setTfa(!tfa);
    }).catch(error => {
      console.error('two factor setting failed');
    });
  }

  return (
		<Wrapper>
      {intra === user ?
    	<Button
				onClick={() => { onClickTfa() }}
				onMouseEnter={() => {setHover(true); console.log(pathVar)}}
      	onMouseLeave={() => {setHover(false)}}>
				{tfa ? '🔒' : '🔓'}</Button> : null }
			<MessageWrapper>
				{hover ? <Message>Two-factor Auth</Message> : null}
			</MessageWrapper>
		</Wrapper>
  )
}

export default UserTfa;