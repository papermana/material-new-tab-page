const React = require('react');
const consts = require('@js/constants');
const AppsCard = require('@components/AppsCard');
const TopSitesCard = require('@components/TopSitesCard');
const WeatherCard = require('@components/WeatherCard');
const getScrollbarWidth = require('@utils/getScrollbarWidth');


const cardsTemplate = {
  apps: AppsCard,
  topSites: TopSitesCard,
  weather: WeatherCard,
};

class Content extends React.PureComponent {
  componentWillMount() {
    this._scrollbarWidth = getScrollbarWidth();
  }

  render() {
    const styles = {
      wrapper: {
        height: `calc(100vh - ${consts.HEADER_HEIGHT}px)`,
        marginTop: 64,
        paddingTop: consts.HEADER_HEIGHT - 64,
        overflowY: 'scroll',
        overflowX: 'hidden',
      },
      main: {
        position: 'relative',
        left: this._scrollbarWidth / 2,
        display: 'flex',
        margin: 'auto',
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'center',
      },
    };

    if (this.props.dimensions.width < consts.breakpoints.medium) {
      styles.main.width = '100%';
    }
    else {
      styles.main.width = 10 / 12 * 100 + '%';
    }

    const features = this.props.model.config && this.props.model.config.features;
    let cards = features && features
    .toMap()
    .filter((value, key) => value && cardsTemplate[key])
    .keySeq()
    .map((value, key) => {
      const Card = cardsTemplate[value];

      return <Card key={key}
        model={this.props.model}
        size={this.props.dimensions.width < consts.breakpoints.medium ? 'small' : 'medium'} />;
    });

    return <div id="main-wrapper" style={styles.wrapper} >
       <div style={styles.main} >
         {cards}
       </div>
     </div>;
  }
}

Content.propTypes = {
  model: consts.propTypes.MODEL.isRequired,
  dimensions: consts.propTypes.DIMENSIONS.isRequired,
};


module.exports = Content;
