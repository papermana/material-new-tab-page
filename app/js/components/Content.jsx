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
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
      },
      message: {
        textAlign: 'center',
      },
    };

    const cardSize = this.props.dimensions.width < consts.breakpoints.medium ? 'small' : 'medium';
    const features = this.props.model.config && this.props.model.config.features;
    let cards = features && features
    .toMap()
    .filter((value, key) => value && cardsTemplate[key])
    .keySeq()
    .map((value, key) => {
      const Card = cardsTemplate[value];

      return <Card key={key}
        model={this.props.model}
        size={cardSize} />;
    });
    const numOfCards = cards && cards.size;

    if (
      this.props.dimensions.width < consts.breakpoints.medium ||
      numOfCards === 1
    ) {
      styles.main.width = consts.cardWidth(cardSize) + consts.cardMargin * 2;
    }
    else {
      styles.main.width = (consts.cardWidth(cardSize) + consts.cardMargin * 2) * 2;
    }

    return <div id="main-wrapper" style={styles.wrapper} >
      {
        !features && null
      }
      {
        features && numOfCards === 0 &&
        <h1 style={styles.message} >
          Go to settings and add some cards! :)
        </h1>
      }
      {
        features && numOfCards > 0 &&
        <div style={styles.main} >
          {cards}
        </div>
      }
    </div>;
  }
}

Content.propTypes = {
  model: consts.propTypes.MODEL.isRequired,
  dimensions: consts.propTypes.DIMENSIONS.isRequired,
};


module.exports = Content;
