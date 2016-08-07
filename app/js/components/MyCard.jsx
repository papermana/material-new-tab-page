const React = require('react');
const Paper = require('material-ui/Paper').default;
const consts = require('@js/constants');


function MyCard(props) {
  const styles = {
    card: {
      display: 'flex',
      width: consts.cardWidth(props.size),
      flexWrap: 'wrap',
      margin: consts.cardMargin,
    },
    cardContent: {
      width: '100%',
      padding: 8,
      position: 'relative',
    },
    cardActions: {
      width: '100%',
      padding: 8,
      borderTop: '1px solid rgba(0,0,0,0.12)',
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
