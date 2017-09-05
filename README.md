# tab-deduper
WebExtension to clean up duplicate tabs.

## Operation
When a tab's location changes, it checks against currently open tabs in the
same window.  If the exact location matches that of an existing tab, the
existing tab is made active, moved to the current tab's position, and the
duplicate tab is removed.

## Permissions
Requires the following permissions:

* `tabs`:  To query tabs and check for matching URLs.
* `cookies`:  To check that two matching tabs are in the same cookie store
(i.e., in the same contextual identity).  Prevents closing tabs being used in
other contexts.
* `notifications`:  To notify a user that their current tab was replaced with
an existing one.
