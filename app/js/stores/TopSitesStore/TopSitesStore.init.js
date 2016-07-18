const actionCreators = require('@js/actionCreators');
const {
  TopSite: TopSiteRecord,
} = require('@stores/TopSitesStore/TopSitesStore.dataTypes');


function init() {
  return new Promise((resolve, reject) => {
    chrome.topSites.get(sites => resolve(sites));
  })
  .then(sites => {
    return sites.map((site, index) => new TopSiteRecord({
      id: 't-s-' + index,
      name: site.title,
      description: site.title,
      url: site.url,
      icon: 'chrome://favicon/' + site.url,
    }));
  })
  .then(topSites => actionCreators.initTopSitesStore(topSites));
}


module.exports = init;
