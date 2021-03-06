1.0.2 / 2014-06-05
------------------

- Fixed pluralizer for locale names with low dash separator ("en_US")


1.0.1 / 2014-05-23
------------------

- Fixed partials locale for generated cache/
- `hasPhrase()` fix for `noFollback = true`.


1.0.0 / 2014-05-23
------------------

- Big rewrite with api change. Internal data simplified. Phrases are now
  compiled in lazy way on `translate()` call.
- Deprecated `getCompiledData()`, `create()`.
- Constructor function can be called as factory (without `new`).
- Added `load()` method in pair to `stringify()`.
- `stringify()` now save fallback info too.
- `hasPhrase()` option `noFallback` to disable phrase search in fallbacks.


0.6.0 / 2014-05-21
------------------

- Coerce plain strings & numbers params to `count` & `value` in `translate()`.
- Added bower support.


0.5.0 / 2014-05-20
------------------

- Added variables support in plurals.
- Added zero-form and other strict numbers forms for plurals.
- Coerce number XXX to { count: XXX } in `translate()`;


0.4.0 / 2014-05-15
------------------

- Added objects support. Now `addPhrase()` can also accept `Number`, `Array`,
  `Boolean` and `Object`. That allows to store i18n data for external libs
  (calendars, time/date generators, ...), when flattened keys format is not ok.


0.3.0 / 2014-04-01
------------------

- Added `stringify` method.
- Drop browser build. Use browserify and other tools.
- Changed internal storage format to generate more compact dumps.
- Some speed opts.


0.2.0 / 2013-04-01
------------------

- Drop `defaultLocale` public property.


0.1.3 / 2013-03-19
------------------

- Migrated tests to mocha
- Fixed docs errors
- Added params check to `getCompiledData()`
- Drop `underscore` dependency.
- Change browserifier to `webmake`.


0.1.2 / 2012-10-23
------------------

- Fixed handling 0 in #{variables}, thanks to @elmigranto
- Updated README samples


0.1.1 / 2012-10-15
------------------

- Refactor internal storage
- Fix flattenParams()
- Improved error reporting on missing params
- Add hasPhrase()


0.1.0 / 2012-08-14
------------------

- Initial release
