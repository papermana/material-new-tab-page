const React = require('react');
const consts = require('@js/constants');
const AppsCard = require('@components/AppsCard');
const TopSitesCard = require('@components/TopSitesCard');


const cardsTemplate = {
  apps: AppsCard,
  topSites: TopSitesCard,
};

function Content(props) {
  const customStyles = {
    main: {},
  };

  if (props.dimensions.width < consts.breakpoints.small) {
    customStyles.main.width = '100%';
  }
  else if (props.dimensions.width < consts.breakpoints.medium) {
    customStyles.main.width = 10 / 12 * 100 + '%';
  }
  else {
    customStyles.main.width = 8 / 12 * 100 + '%';
  }

  const features = props.model.config && props.model.config.features;
  let cards = features && features
  .toMap()
  .filter((value, key) => value && cardsTemplate[key])
  .keySeq()
  .map((value, key) => {
    const Card = cardsTemplate[value];

    return <Card key={key}
      model={props.model} />;
  });

  return <div style={styles.wrapper} >
     <div style={Object.assign({}, styles.main, customStyles.main)} >
       {cards}
     </div>
   </div>;
}

Content.propTypes = {
  model: consts.propTypes.MODEL.isRequired,
  dimensions: consts.propTypes.DIMENSIONS.isRequired,
};

const styles = {
  main: {
    height: 500,
    margin: 'auto',
    backgroundColor: 'red',
    overflow: 'auto',
  },
};


module.exports = Content;
