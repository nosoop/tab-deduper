# tab-deduper
WebExtension to clean up duplicate tabs.  Tested in Firefox.

## Operation
When a tab's location changes, it checks against currently open tabs in the
same window.  On a match, one is made active and the other is removed.

Great for tab hoarders that revisit pages that are already open in a different
tab.

## Permissions
Requires the following permissions:

* `tabs`:  To query tabs and check for matching URLs.
* `cookies`:  To check that two matching tabs are in the same cookie store
(i.e., in the same contextual identity).  Prevents closing tabs being used in
other contexts, such as in different containers.
* `notifications`:  To notify a user that their current tab was replaced with
an existing one.
* `storage`:  To store extension settings.