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
                    tabs: []
                  }, null);
                },
  tab_func:     function(info){
                  chrome.storage.sync.get(['enabled', 'tabs'], function(i){
                    chrome.tabs.get(info.tabId, function(tab) {
                      const enabled = i['enabled'], tabs = i['tabs'];
                      if (enabled)
                        momo.do_func(tab, enabled)
                      else
                        momo.do_func(tab, tabs.includes(tab.id))
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

/* on extension button clicked
 note: grayscaling/coloring of all websites cleans tabs array
*/
chrome.browserAction.onClicked.addListener(function(tab){
  chrome.storage.sync.get('enabled', function(i){
    const set = i['enabled'];

    momo.do_func(tab, !set);
    chrome.storage.sync.set({enabled: !set, tabs: []}, function() {
      chrome.runtime.error ? console.error(chrome.runtime.lastError) : false ;
    });
  });
});

/* on tab switch */
chrome.tabs.onActivated.addListener(momo.tab_func);
chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
  momo.tab_func({tabId: tabId})
});

/* on command */
chrome.commands.onCommand.addListener(function(cmd, tab){
  if (cmd == "tab_action") { /* momo of a single tab */
    chrome.storage.sync.get(['enabled','tabs'], function(props) {
      var tabs = props['tabs'];

      if (props['enabled'] || !momo.tab_validate(tab))
        return;

      if (tabs.includes(tab.id)) {
        tabs.splice(tabs.indexOf(tab.id), 1);
        momo.do_func(tab, false);
      } else {
        tabs.push(tab.id);
        momo.do_func(tab, true);
      }
      chrome.storage.sync.set({tabs: tabs}, null);
    });
  }
});
