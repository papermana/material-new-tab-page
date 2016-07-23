const React = require('react');
const {
  Card,
  CardActions,
  FlatButton,
} = require('material-ui');
const consts = require('@js/constants');
const Tile = require('@components/Tile');


function AppsCard(props) {
  const tiles = props.model.favoriteApps && props.model.favoriteApps
  .map((value, key) => {
    return <Tile key={key} app={props.model.apps.find(app => app.id === value)} />;
  });

  return <Card style={styles.card} >
    <div>
      {tiles}
    </div>
    <CardActions>
      <FlatButton label="All Apps" />
    </CardActions>
  </Card>;
}

AppsCard.propTypes = {
  model: consts.propTypes.MODEL.isRequired,
};

const styles = {
  card: {
    width: 'calc(50% - 32px)',
    margin: '16px',
  },
};


module.exports = AppsCard;
