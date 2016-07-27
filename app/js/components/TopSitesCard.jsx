const React = require('react');
const consts = require('@js/constants');
const MyCard = require('@components/MyCard');
const Tile = require('@components/Tile');


function TopSitesCard(props) {
  const tiles = props.model.topSites && props.model.topSites
  .map((value, key) => {
    return <Tile key={key}
      app={value}
      size={props.size}
      smallIcons />;
  })
  .setSize(12)
  .toJS();

  return <MyCard tiles={tiles}
    size={props.size} />;
}

TopSitesCard.propTypes = {
  model: consts.propTypes.MODEL.isRequired,
  size: React.PropTypes.string.isRequired,
};


module.exports = TopSitesCard;
