import Header from '../shared/header';

const AboutPage = ({title}) => {
  return (
    <>
      <div>
        <Header title={title} />
        <h1>Kast</h1>
        <p>Kast allows users to view or post status updates for a particular location.
        Ever wonder what the current wait time is for a restaurant?
        Are tickets for a popular movie sold out?
        Are all the tennis courts full? </p>
        <p>At Kast, you can check the lastest updates!</p>
      </div>
    </>
  );
};

export default AboutPage;