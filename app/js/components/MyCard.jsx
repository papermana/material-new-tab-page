const React = require('react');
const Paper = require('material-ui/Paper').default;
const consts = require('@js/constants');


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
      width: '100%',
      padding: 8,
      position: 'relative',
    },
    cardActions: {
      width: '100%',
      padding: 8,
    },
  };

  return <Paper style={styles.card} >
    <div style={styles.cardContent} >
      {props.tiles || props.children}
    </div>
    {
      props.cardActions &&
      <div style={styles.cardActions}>
        {props.cardActions}
      </div>
    }
  </Paper>;
}

MyCard.propTypes = {
  tiles: React.PropTypes.arrayOf(React.PropTypes.node),
  children: consts.propTypes.CHILDREN,
  cardActions: React.PropTypes.arrayOf(React.PropTypes.node),
  size: React.PropTypes.oneOf([
    'small',
    'medium',
  ]).isRequired,
};


module.exports = MyCard;
