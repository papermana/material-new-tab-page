const actionCreators = require('@js/actionCreators');
const storageHelpers = require('@utils/chromeStorageHelpers');
const {
  App: AppRecord,
} = require('@stores/AppsStore/appsStoreDataTypes');


function init() {
  return new Promise((resolve, reject) => {
    chrome.management.getAll(apps => resolve(apps));
  })
  .then(apps => {
    const PREFERRED_ICON_SIZE = 128;

    apps = apps
    .filter(app => {
      return ['hosted_app', 'packaged_app', 'legacy_packaged_app'].includes(app.type) && app.enabled;
    })
    .map(app => new AppRecord({
      id: app.id,
      name: app.shortName || app.name,
      description: app.description || app.name || app.shortName,
      url: app.appLaunchUrl,
      icon: findIcon(app, PREFERRED_ICON_SIZE),
    }));

    apps.push(new AppRecord({
      id: 'chrome-web-store',
      name: 'Chrome Web Store',
      description: 'Get more apps at Google Web Store!',
      url: 'https://chrome.google.com/webstore/category/apps',
      icon: 'assets/chrome_web_store.png',
    }));

    return apps;
  })
  .then(allApps => {
    return storageHelpers.getFromStorage('favoriteApps')
    .then(favoriteApps => {
      if (!favoriteApps) {
        if (allApps.length <= 12) {
          favoriteApps = allApps;
        }
        else {
          const appsWithIcons = allApps
          .filter(app => app.icon);

          if (appsWithIcons.length >= 12) {
            favoriteApps = appsWithIcons;
          }
          else {
            const appsWithoutIcons = allApps
            .filter(app => !app.icon);

            favoriteApps = appsWithIcons.concat(appsWithoutIcons);
          }
        }

        favoriteApps = favoriteApps
        .slice(0, 12)
        .map(app => app.id);
      }

      favoriteApps = favoriteApps
      .slice(0, 12);

      return {
        allApps,
        favoriteApps,
      };
    });
  })
  .then(apps => actionCreators.initAppsStore(apps));
}

function findIcon(app, preferredSize) {
  if (!app.icons) {
    return undefined;
  }

  if (preferredSize) {
    const icon = app.icons.find(icon => icon.size === preferredSize);

    if (icon) {
      return icon.url;
    }
  }

  const sorted = app.icons.sort((a, b) => a.size - b.size);

  return sorted.pop().url;
}


module.exports = init;
