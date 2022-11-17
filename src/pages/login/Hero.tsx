import styled, { css } from "styled-components";
import { motion } from "framer-motion";

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0.5em;
  @media (max-width: 1100px) {
    flex-direction: column;
    padding: 0;
  }
`;

const SectionWrapper = styled.div`
  width: 60%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: center;
  @media (max-width: 1100px) {
    align-items: center;
  }
`;

const titleShadow = css`
  text-shadow: 0.05em 0.1em var(--purple);
`;

const Title = styled.h1`
  width: 100%;
  display: inline-block;
  text-transform: uppercase;
  ${titleShadow}
  font-size: 3em;
  font-weight: 700;
  margin: 0 0 0.3em 0;
  @media (max-width: 1100px) {
    display: none;
  }
`;

const SubTitle = styled.h1`
  width: 100%;
  display: none;
  text-transform: uppercase;
  ${titleShadow}
  font-size: 3em;
  font-weight: 700;
  margin: 0 0 0.3em 0;
  @media (max-width: 1100px) {
    display: inline-block;
  }
`;

const ArticleWrapper = styled.div`
  padding: 3em;
`;

const Article = styled.article`
  display: inline-block;
  font-size: 1.5em;
  margin-bottom: 1em;
  width: 100%;
`;

const Button = styled.a`
  text-decoration: none;
  text-align: center;
  padding: 0.5em;
  font-size: 2em;
  border-radius: 0.5em;
  background: var(--yellow);
  color: var(--dark-gray);
  margin: 1em;
  &:hover {
    transform: scale(1.1, 1.1);
  }
`;

const Scroll = styled(motion.div)`
  color: var(--white);
  margin-top: 7rem;
  font-size: 3rem;
  font-family: sans-serif;
  text-shadow: 0 -1.5rem 0 var(--white);
`;

const Hero = () => {
  return (
    <Wrapper>
      <SectionWrapper>
        <Title>ft_transcendence</Title>
        <SubTitle>트뽀</SubTitle>
        <ArticleWrapper>
          <Article>
            Soon, you will realize that you already know things that you thought
            you didn't.
          </Article>
          <Article>
            No more C! No more C++! This project is about doing something you've
            never done before. Remind yourself the beginning of your journey in
            computer science. Look at you now. Time to shine!
          </Article>
          <Article>
            This project is about creating a website for the mighty Pong
            contest!
          </Article>
        </ArticleWrapper>
      </SectionWrapper>
      <Button href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-8da575687fd06cd856e002bd2352a348072433d4faec75f47bab2925ef6be4c2&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fauth&response_type=code">
        START
      </Button>
      <Scroll animate={{ y: [0, 42, 0] }} transition={{ repeat: Infinity }}>
        V
      </Scroll>
    </Wrapper>
  );
};

export default Hero;
