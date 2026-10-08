# Changelog

All notable changes to this project will be documented in this file.

## [1.0.3] - 2026-10-08

### Fixed
- Allow repository owners to approve their own pull requests before publishing

## [1.0.2] - 2026-10-08

### Changed
- Validate release metadata on pull requests
- Publish to npm automatically after an approved merged pull request via trusted publishing

## [1.0.1] - 2026-10-08

### Changed
- Validate that SECURITY.md supports the package version in pull request CI

## [1.0.0] - 2026-01-09

### Added
- Initial release
- `no-em-dash` rule to disallow em dash characters (U+2014) in strings
- Support for ESLint 8.x and 9.x (flat config)
