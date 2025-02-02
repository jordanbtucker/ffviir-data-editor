# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0-a.2] - 2025-02-02

### Fixed

- Files are now saved in the chosen location instead of in the original path.
  (#16)

## [2.0.0-a.1] - 2025-02-02

### Fixed

- Fixed "Do not know how to serialize a BigInt" error. (#15)
- FName values show as disabled since they cannot be changed.

## [2.0.0-a.0] - 2025-02-01

### BREAKING CHANGES

- Works exclusively with Final Fantasy VII Rebirth.
- FName values cannot be changed.

### Fixed

- FName values are displayed correctly.

## [1.0.0-b.8] - 2022-01-17

### Added

- Data can be imported and exported to and from CSV files.
- Errors can easily be reported to the issue tracker.

### Changed

- The Find feature works on headers.
- The Open File window remembers the last used location.

### Fixed

- Boolean values in arrays are read properly. This fixes an issue with
  `BattleAICharaSpec` files.
- The Save menu option is disabled until a file has been opened.
- The correct filename shows in the save notificaiton.
- A visual bug causing some text to appear over headers is fixed.
- A bug causing text values to appear next to text IDs is fixed.
- Errors are less likely to cause silent failures.

## [1.0.0-b.7] - 2022-01-11

### Changed

- The index column stays in place to help you keep track of which row you're
  editing.

### Fixed

- A bug that caused arrays to be saved incorrectly is fixed.

## [1.0.0-b.6] - 2022-01-10

### Added

- Text can be search for via Edit > Find.

## [1.0.0-b.5] - 2022-01-09

### Fixed

- Incorrect characters in text values are fixed.

## [1.0.0-b.4] - 2022-01-09

### Added

- Numeric values are validated for type and range.

## [1.0.0-b.3] - 2022-01-09

### Added

- Text IDs can be shown as their values. This is enabled by default.

## [1.0.0-b.2] - 2022-01-09

### Added

- FName elements in arrays can be modified.

## [1.0.0-b.1] - 2022-01-09

### Fixed

- Fixed a bug that caused FString values to not show.

## [1.0.0-b.0] - 2022-01-09

### Added

- Elements in arrays can be modified, but not the length of the array.
- Files can be opened and saved via the menu and shortcut keys.
- The Open and Save buttons stay on screen instead of scrolling.

## [1.0.0-a.1] - 2021-12-30

### Added

- FName values can be changed.

### Changed

- Cells show as green instead of yellow to indicate they've been changed.

## [1.0.0-a.0] - 2021-12-30

### Added

- Initial implementation

[unreleased]: https://github.com/jordanbtucker/ff7r-data-editor/commits/main/
[2.0.0-a.2]:
  https://github.com/jordanbtucker/ff7r-data-editor/releases/tag/v2.0.0-a.2
[2.0.0-a.1]:
  https://github.com/jordanbtucker/ff7r-data-editor/releases/tag/v2.0.0-a.1
[2.0.0-a.0]:
  https://github.com/jordanbtucker/ff7r-data-editor/releases/tag/v2.0.0-a.0
[1.0.0-b.8]:
  https://github.com/jordanbtucker/ff7r-data-editor/releases/tag/v1.0.0-b.8
[1.0.0-b.7]:
  https://github.com/jordanbtucker/ff7r-data-editor/releases/tag/v1.0.0-b.7
[1.0.0-b.6]:
  https://github.com/jordanbtucker/ff7r-data-editor/releases/tag/v1.0.0-b.6
[1.0.0-b.5]:
  https://github.com/jordanbtucker/ff7r-data-editor/releases/tag/v1.0.0-b.5
[1.0.0-b.4]:
  https://github.com/jordanbtucker/ff7r-data-editor/releases/tag/v1.0.0-b.4
[1.0.0-b.3]:
  https://github.com/jordanbtucker/ff7r-data-editor/releases/tag/v1.0.0-b.3
[1.0.0-b.2]:
  https://github.com/jordanbtucker/ff7r-data-editor/releases/tag/v1.0.0-b.2
[1.0.0-b.1]:
  https://github.com/jordanbtucker/ff7r-data-editor/releases/tag/v1.0.0-b.1
[1.0.0-b.0]:
  https://github.com/jordanbtucker/ff7r-data-editor/releases/tag/v1.0.0-b.0
[1.0.0-a.1]:
  https://github.com/jordanbtucker/ff7r-data-editor/releases/tag/v1.0.0-a.1
[1.0.0-a.0]:
  https://github.com/jordanbtucker/ff7r-data-editor/releases/tag/v1.0.0-a.0
