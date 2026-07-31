# Change Log

## Next release

## 2.2.6.5

- Fixed the change history to always show the newest entries first by enforcing descending change IDs in a module-owned server endpoint, using GET requests for webtrees 2.2 and POST requests for webtrees 2.3.
- Extended human-readable summaries to cover multiple unambiguous changes within one GEDCOM diff.
- Ignored `CHAN` metadata when creating human-readable change summaries.
- Added summaries for baptism changes and for complete recognized event substructures that are added or removed.
- Added a dedicated summary when every line of a newly created individual is marked as inserted.
- Prevented GEDCOM details from being wrapped repeatedly when a table is redrawn.

- Updated Dutch translations; thanks to @TheDutchJewel.
- Added compatibility with webtrees 2.3 while retaining webtrees 2.2.6 support.
- Replaced jQuery-dependent table event handling with a DataTables 1/2 compatibility bridge.
- Added automated compatibility checks for both supported webtrees versions.
- Added configurable visibility for the record column and changed the defaults to show the user column while hiding the record and family-tree columns.
- Replaced the status text with color-coded indicators and translated tooltips.
- Added module-specific column visibility labels so translations no longer depend on ambiguous webtrees core wording.
- Added an administrator action to reset all display settings to their defaults.
- Added combinable server-side filters for date range, status, user, and old or new GEDCOM data.
- Added a filter reset action that reloads the unfiltered change history for the individual.
- Added localized human-readable summaries for unambiguous changes to common GEDCOM facts.
- Kept the complete raw GEDCOM diff available for summarized changes and used it as the fallback for complex or unknown structures.
- Fixed the individual filter so the INDI xref is sent in both the query string and POST data for webtrees 2.2/2.3 compatibility.
- Fixed status indicators being rendered in the wrong visible column when other columns were hidden.
- Applied the configured column visibility explicitly: GEDCOM data is always visible, the user is shown by default, and record/tree columns are hidden by default.
- Moved the module history from the README introduction into a revised Credits section.
- Moved GEDCOM data to the rightmost column, disabled interactive sorting for every column, and retained the fixed newest-first order.

## 2.2.6.4

- Fixed stylesheet registration so GEDCOM lines and inserted/deleted data are formatted and highlighted again.

## 2.2.6.3

- Added compact display settings for an optional date range and maximum entry count.
- Added per-entry expand/collapse controls for GEDCOM details.
- Added settings to show or hide the user and family-tree columns.
- Switched the module stylesheet to standard webtrees asset loading.

## 2.2.6.2

- Added Dutch translation; thanks to @TheDutchJewel.
- Revised and streamlined the README documentation.

## 2.2.6.1

- Updated the module for compatibility with webtrees 2.2.6.
- Added maintained German gettext translations and compiled the corresponding MO catalog.
- Reused webtrees core translations through the module's `MoreI18N` wrapper instead of duplicating them in the module catalog.
- Added release and download badges to the README.
- Corrected the module version from `2.6.6.0` to the webtrees-compatible `2.2.6.x` version series.
