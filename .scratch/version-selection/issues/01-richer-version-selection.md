# Richer version selection for reviews

Status: needs-triage

## Problem

A review records the package version it is about. The version should be a real
published version. Many packages publish hundreds of versions, which makes a
plain list unusable.

## Scope

- Design a version picker that handles a long version list. Options to consider:
  group by major, show only the latest patch of each minor, or offer a filter.
- Add an option to leave the version blank.
- Validate that a non-blank version is a real published version of the package.
  The version list comes from the npm registry document.
- The picker must degrade without JavaScript.

## Notes

`createReviewSchema` currently accepts any string, with a `v.picklist([''])`
union so that an empty form field passes.
