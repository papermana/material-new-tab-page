const React = require('react');
const consts = require('@js/constants');
const AppsCard = require('@components/AppsCard');
const TopSitesCard = require('@components/TopSitesCard');


const cardsTemplate = {
  apps: AppsCard,
  topSites: TopSitesCard,
};

function Content(props) {
  const styles = {
    wrapper: {
      paddingTop: consts.HEADER_HEIGHT,
    },
    main: {
      display: 'flex',
      margin: 'auto',
      flexWrap: 'wrap',
      flexDirection: 'row',
      justifyContent: 'center',
    },
  };

  if (props.dimensions.width < consts.breakpoints.medium) {
    styles.main.width = '100%';
  }
  else {
    styles.main.width = 10 / 12 * 100 + '%';
  }

  const features = props.model.config && props.model.config.features;
  let cards = features && features
  .toMap()
  .filter((value, key) => value && cardsTemplate[key])
  .keySeq()
  .map((value, key) => {
    const Card = cardsTemplate[value];

    return <Card key={key}
      model={props.model}
      size={props.dimensions.width < consts.breakpoints.medium ? 'small' : 'medium'} />;
  });

  return <div style={styles.wrapper} >
     <div style={styles.main} >
       {cards}
     </div>
   </div>;
}

Content.propTypes = {
  model: consts.propTypes.MODEL.isRequired,
  dimensions: consts.propTypes.DIMENSIONS.isRequired,
};


module.exports = Content;
