const React = require('react');
const Card = require('material-ui/Card').default;
const CardActions = require('material-ui/Card/CardActions').default;


function MyCard(props) {
  const size = props.size === 'small' ? 96 : 128;
  const styles = {
    card: {
      display: 'flex',
      width: size * 4 + 16,
      flexWrap: 'wrap',
      margin: 16,
    },
    cardContent: {
      padding: 8,
    },
  };

  return <Card style={styles.card} >
    <div style={styles.cardContent} >
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
