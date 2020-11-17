'use strict';

var url_re = /^https*\:\/\//i;

var do_func = function (tab, val) {
  if (url_re.test(tab.url) && tab.status === "complete") {
    //console.log(url_re.test(tab.url), tab.url, val)
    if (val)
      chrome.tabs.insertCSS(tab.id, {
          code:'html{filter: grayscale(100%);}'}, null);
    else
      chrome.tabs.insertCSS(tab.id, {code:'html{filter: none;}'}, null);
  }
};

var init_storage = function() {
  chrome.storage.sync.set({
    enabled: false
  }, null);
}

var tab_func = function(info){
  chrome.storage.sync.get('enabled', function(i){
    chrome.tabs.get(info.tabId, function(tab) {
      do_func(tab, i['enabled'])
    })
  });
}

/* store default */
chrome.runtime.onInstalled.addListener(init_storage);

/* chrome.tabs.onUpdated.addListener(do_func); */
chrome.browserAction.onClicked.addListener(function(tab){
  chrome.storage.sync.get('enabled', function(i){
    var set = i['enabled'];

    do_func(tab, !set)
    chrome.storage.sync.set({enabled: !set}, function() {
      chrome.runtime.error ? console.error(chrome.runtime.lastError) : false ;
    });
  });
});

/* on tab switch */
chrome.tabs.onActivated.addListener(tab_func);
chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
  tab_func({tabId: tabId})
});
