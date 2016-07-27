const React = require('react');
const {
  FlatButton,
} = require('material-ui');
const consts = require('@js/constants');
const MyCard = require('@components/MyCard');
const Tile = require('@components/Tile');


function AppsCard(props) {
  const tiles = props.model.favoriteApps && props.model.favoriteApps
  .map((value, key) => {
    return <Tile key={key}
      app={props.model.apps.find(app => app.id === value)}
      size={props.size} />;
  })
  .toJS();
  const actions = [
    <FlatButton key={0} label="All Apps" />,
  ];

  return <MyCard tiles={tiles}
    cardActions={actions}
    size={props.size} />;
}

AppsCard.propTypes = {
  model: consts.propTypes.MODEL.isRequired,
  size: React.PropTypes.string.isRequired,
};


module.exports = AppsCard;
