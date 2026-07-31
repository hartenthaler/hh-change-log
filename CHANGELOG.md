# Change Log

## Next release

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
