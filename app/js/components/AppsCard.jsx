const React = require('react');
const {
  Card,
  CardActions,
  FlatButton,
} = require('material-ui');
const consts = require('@js/constants');
const Tile = require('@components/Tile');


function AppsCard(props) {
  const size = props.size === 'small' ? 96 : 128;
  const tiles = props.model.favoriteApps && props.model.favoriteApps
  .map((value, key) => {
    return <Tile key={key} app={props.model.apps.find(app => app.id === value)} size={size} />;
  });
  const styles = {
    card: {
      display: 'flex',
      width: size * 4,
      flexWrap: 'wrap',
      margin: 16,
    },
  };

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
  size: React.PropTypes.oneOf([
    'small',
    'medium',
  ]).isRequired,
};


module.exports = AppsCard;
