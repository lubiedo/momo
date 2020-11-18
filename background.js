'use strict';

var momo = {
   url_re:  /^https*\:\/\//i,
  do_func:  function (tab, val) {
              if (this.tab_validate(tab))
                if (val)
                  chrome.tabs.insertCSS(tab.id, {
                      code:'html{filter: grayscale(100%);}'}, null);
                else
                  chrome.tabs.insertCSS(tab.id, {code:'html{filter: none;}'}, null);
            },
  init_storage: function() {
                  let default_enabled = false;

                  /* check if OS is in dark mode */
                  if (window.matchMedia &&
                    window.matchMedia('(prefers-color-scheme: dark)').matches)
                    default_enabled = true

                  chrome.storage.sync.set({
                    enabled:    default_enabled,
                  }, null);
                },
  tab_func:     function(info){
                  chrome.storage.sync.get('enabled', function(i){
                    chrome.tabs.get(info.tabId, function(tab) {
                      momo.do_func(tab, i['enabled'])
                    })
                  });
                },
  tab_validate: function(tab) {
                  return (this.url_re.test(tab.url) &&
                    tab.status === "complete")
                }
}

/* store default */
chrome.runtime.onInstalled.addListener(momo.init_storage);

/* on extension button clicked */
chrome.browserAction.onClicked.addListener(function(tab){
  chrome.storage.sync.get('enabled', function(i){
    const set = i['enabled'];

    momo.do_func(tab, !set)
    chrome.storage.sync.set({enabled: !set}, function() {
      chrome.runtime.error ? console.error(chrome.runtime.lastError) : false ;
    });
  });
});

/* on tab switch */
chrome.tabs.onActivated.addListener(momo.tab_func);
chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
  momo.tab_func({tabId: tabId})
});
