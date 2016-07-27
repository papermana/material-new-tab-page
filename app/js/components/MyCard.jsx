const React = require('react');
const {
  Card,
  CardActions,
} = require('material-ui');


function MyCard(props) {
  const size = props.size === 'small' ? 96 : 128;
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
      {props.tiles}
    </div>
    {
      props.cardActions &&
      <CardActions>
        {props.cardActions}
      </CardActions>
    }
  </Card>;
}

MyCard.propTypes = {
  tiles: React.PropTypes.arrayOf(React.PropTypes.node),
  cardActions: React.PropTypes.arrayOf(React.PropTypes.node),
  size: React.PropTypes.oneOf([
    'small',
    'medium',
  ]).isRequired,
};


module.exports = MyCard;
