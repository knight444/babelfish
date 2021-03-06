/*global it, describe*/

'use strict';


var assert = require('assert');
var BabelFish = require('../lib/babelfish');

var isFunction = function isFunction(obj) {
  return Object.prototype.toString.call(obj) === '[object Function]';
};


describe('API consistence tests', function () {

  describe('Exported module', function () {

    it('is a constructor', function () {
      assert.ok(isFunction(BabelFish));
      assert.ok((new BabelFish()) instanceof BabelFish);
    });
  });


  describe('Instance', function () {
    var b = new BabelFish();

    it('has methods', function () {
      assert.ok(isFunction(b.addPhrase));
      assert.ok(isFunction(b.setFallback));
      assert.ok(isFunction(b.translate));
    });

    it('has `t()` alias', function () {
      assert.strictEqual(b.t, b.translate);
    });
  });
});


describe('Behavior and unit tests come here', function () {

  describe('When fallback is given', function () {
    var b = new BabelFish('en');

    b.setFallback('es',    [ 'es-ES', 'es-MX' ]);
    b.setFallback('es-ES', [ 'es', 'es-US' ]);

    b.addPhrase('en',    'aaa', 'aaa (en)');
    b.addPhrase('en',    'bbb', 'bbb (en)');
    b.addPhrase('en',    'ccc', 'ccc (en)');
    b.addPhrase('en',    'ddd', 'ddd (en)');
    b.addPhrase('es',    'aaa', 'aaa (es)');
    b.addPhrase('es-ES', 'bbb', 'bbb (es-ES)');
    b.addPhrase('es-MX', 'ccc', 'ccc (es-MX)');
    b.addPhrase('es-US', 'ddd', 'ddd (es-US)');

    b.setFallback('es-US', [ 'es' ]);

    it('use defaultLocale in worst case', function () {
      assert.equal(b.t('es', 'ddd'), 'ddd (en)');
      assert.equal(b.t('ru', 'ddd'), 'ddd (en)');
    });

    it('allows specify more than one fallback locale', function () {
      assert.equal(b.t('es', 'aaa'), 'aaa (es)');
      assert.equal(b.t('es', 'bbb'), 'bbb (es-ES)');
      assert.equal(b.t('es', 'ccc'), 'ccc (es-MX)');
      assert.equal(b.t('es', 'ddd'), 'ddd (en)');
    });

    it('do not recursively resolve locale fallbacks', function () {
      assert.equal(b.t('es-ES', 'aaa'), 'aaa (es)');
      assert.equal(b.t('es-ES', 'bbb'), 'bbb (es-ES)');
      assert.equal(b.t('es-ES', 'ccc'), 'ccc (en)');
      assert.equal(b.t('es-ES', 'ddd'), 'ddd (es-US)');
    });

    it('allow specify fallbacks after phrases were added', function () {
      assert.equal(b.t('es-US', 'aaa'), 'aaa (es)');
      assert.equal(b.t('es-US', 'bbb'), 'bbb (en)');
      assert.equal(b.t('es-US', 'ccc'), 'ccc (en)');
      assert.equal(b.t('es-US', 'ddd'), 'ddd (es-US)');
    });

    it('allows re-assign fallbacks', function () {
      b.setFallback('es-US', [ 'es-ES', 'es-MX' ]);

      assert.equal(b.t('es', 'aaa'), 'aaa (es)');
      assert.equal(b.t('es', 'bbb'), 'bbb (es-ES)');
      assert.equal(b.t('es', 'ccc'), 'ccc (es-MX)');
      assert.equal(b.t('es', 'ddd'), 'ddd (en)');
    });
  });


  describe('Setting fallback for defaultLocale', function () {
    var b = new BabelFish('en');

    it('cause exception', function () {
      assert.throws(function () { b.setFallback('en', [ 'en-GB' ]); }, Error);
    });
  });


  describe('Adding phrases', function () {
    var b = new BabelFish('en');

    b.addPhrase('en', 'phrase1',       'foobar');
    b.addPhrase('en', 'scope.phrase2', 'foobar');
    b.addPhrase('en', 'scope',         { phrase3: 'foobar' });

    it('allows specify phrase within `global` scope', function () {
      assert.equal(b.t('en', 'phrase1'), 'foobar');
    });

    it('allows specify phrase prefixed with scope', function () {
      assert.equal(b.t('en', 'scope.phrase2'), 'foobar');
    });

    it('allows specify translations as inner scope', function () {
      assert.equal(b.t('en', 'scope.phrase3'), 'foobar');
    });
  });


  describe('Translating a phrase', function () {

    it('returns a string', function () {
      var b = new BabelFish('en');
      b.addPhrase('en', 'a', 'a (en)');
      b.addPhrase('en', 'b', 'b (en)');
      b.addPhrase('ru', 'b', 'b (ru) #{foo}');

      assert.equal(b.t('en', 'a'), 'a (en)');
      assert.equal(b.t('en', 'b'), 'b (en)');
      assert.equal(b.t('ru', 'b', { foo: 'bar' }), 'b (ru) bar');
    });

    it('returns a pure object', function () {
      var b = new BabelFish('en');
      b.addPhrase('en', 'a', { foo: 2, bar: 3 }, false);
      b.addPhrase('en', 'b', [ 4, 5, 6 ]);
      b.addPhrase('en', 'c', 123);
      b.addPhrase('en', 'd', true);

      assert.deepEqual(b.t('en', 'a'), { foo: 2, bar: 3 });
      assert.deepEqual(b.t('en', 'b'), [ 4, 5, 6 ]);
      assert.strictEqual(b.t('en', 'c'), 123);
      assert.strictEqual(b.t('en', 'd'), true);
    });

    it('coerces numbers', function () {
      var b = new BabelFish('en');
      b.addPhrase('en', 'a', 'total #{count}');

      assert.equal(b.t('en', 'a', 5), 'total 5');
    });

    it('unescape #', function () {
      var b = new BabelFish('en');
      b.addPhrase('en', 'a', 'total \\#{count}');

      assert.equal(b.t('en', 'a', 5), 'total #{count}');
    });

    it('ignores provided params when they are not needed', function () {
      var b = new BabelFish('en');
      b.addPhrase('en', 'a', 'a (en)');

      assert.equal(b.t('en', 'a', { foo: 'bar', bar: 'baz' }), 'a (en)');
    });

    it('replaces missing params with [missed variable: <name>]', function () {
      var b = new BabelFish('en');
      b.addPhrase('ru', 'a', 'a (ru) #{foo}');
      b.addPhrase('es', 'a', 'a (es) #{f.o}');

      assert.equal(b.t('ru', 'a'), 'a (ru) [missed variable: foo]');
      assert.equal(b.t('es', 'a'), 'a (es) [missed variable: f.o]');
    });

    it('honors objects in params', function () {
      var b = new BabelFish('en');
      b.addPhrase('es', 'a', 'a (es) #{f.o}');

      assert.equal(b.t('es', 'a', { f: { o: 'bar' } }), 'a (es) bar');
    });

    it('reports missing translation', function () {
      var b = new BabelFish('en');
      b.addPhrase('fr', 'd', 'd (fr) ((une|autre)):count');

      assert.equal(b.t('en', 'd', { count: 0 }), 'en: No translation for [d]');
    });

    it('honors pluralization', function () {
      var b = new BabelFish('en');
      b.addPhrase('en', 'a', 'a (en) ((one|other)):count');
      b.addPhrase('fr', 'b', 'b (fr) ((une|autre)):count');

      assert.equal(b.t('en', 'a', { count: 0 }), 'a (en) other');
      assert.equal(b.t('en', 'a', { count: 1 }), 'a (en) one');
      assert.equal(b.t('en', 'a', { count: 2 }), 'a (en) other');
      assert.equal(b.t('fr', 'a', { count: 0 }), 'a (en) other');

      // check that we use correct pluralizer
      assert.equal(b.t('en', 'a', { count: 1 }),   'a (en) one');
      assert.equal(b.t('en', 'a', { count: 1.5 }), 'a (en) other');
      assert.equal(b.t('fr', 'b', { count: 0 }),   'b (fr) une');
      assert.equal(b.t('fr', 'b', { count: 1.5 }), 'b (fr) une');
    });

    it('honors pluralization with default anchor', function () {
      var b = new BabelFish('en');
      b.addPhrase('en', 'a', 'a (en) ((one|other))');

      assert.equal(b.t('en', 'a', { count: 0 }), 'a (en) other');
      assert.equal(b.t('en', 'a', { count: 1 }), 'a (en) one');
      assert.equal(b.t('en', 'a', { count: 2 }), 'a (en) other');
    });

    it('replaces invalid plurals amount with [invalid plurals amount: <name>(<value>)]', function () {
      var b = new BabelFish('en');
      b.addPhrase('en', 'c', 'c (en) ((one|other)):count');

      assert.equal(b.t('en', 'c'), 'c (en) [invalid plurals amount: count(undefined)]');
      assert.equal(b.t('en', 'c', { count: null }), 'c (en) [invalid plurals amount: count(null)]');
      assert.equal(b.t('en', 'c', { count: 'foo' }), 'c (en) [invalid plurals amount: count(foo)]');
    });

    describe('language name separators', function () {

      it('`-` sould be ok', function () {
        var b = new BabelFish('en');
        b.addPhrase('en-US', 'a', 'a (en) ((one|other))');

        assert.equal(b.t('en-US', 'a', { count: 0 }), 'a (en) other');
        assert.equal(b.t('en-US', 'a', { count: 1 }), 'a (en) one');
        assert.equal(b.t('en-US', 'a', { count: 2 }), 'a (en) other');
      });

      it('`_` sould be ok', function () {
        var b = new BabelFish('en');
        b.addPhrase('en_US', 'a', 'a (en) ((one|other))');

        assert.equal(b.t('en_US', 'a', { count: 0 }), 'a (en) other');
        assert.equal(b.t('en_US', 'a', { count: 1 }), 'a (en) one');
        assert.equal(b.t('en_US', 'a', { count: 2 }), 'a (en) other');
      });
    });

    describe('variables in plurals', function () {

      it('should replace variable in plural', function () {
        var b = new BabelFish('en');
        b.addPhrase('en', 'nested1', '((#{count}|many))');
        b.addPhrase('en', 'nested2', '((#{var1} #{var2}|many))');

        assert.equal(b.t('en', 'nested1', { count: 1 }), '1');
        assert.equal(b.t('en', 'nested1', { count: 2 }), 'many');
        assert.equal(b.t('en', 'nested2', { count: 1, var1: 4, var2: 5 }), '4 5');
        assert.equal(b.t('en', 'nested2', { count: 2, var1: 4, var2: 5 }), 'many');
      });

      it('should preserve escaped sequence in plural', function () {
        var b = new BabelFish('en');
        b.addPhrase('en', 'escaped', '((=0 \\#{count} strict|\\#{count} one|few))');

        assert.equal(b.t('en', 'escaped', { count: 0 }), '#{count} strict');
        assert.equal(b.t('en', 'escaped', { count: 1 }), '#{count} one');
        assert.equal(b.t('en', 'escaped', { count: 2 }), 'few');
      });
    });

    describe('strict values', function () {

      it('rewritten zero form', function () {
        var b = new BabelFish('en');
        b.addPhrase('en', 'test', '((=0 no nails|#{count} nail|#{count} nails))');

        assert.equal(b.t('en', 'test', { count: 0 }), 'no nails');
        assert.equal(b.t('en', 'test', { count: 1 }), '1 nail');
        assert.equal(b.t('en', 'test', { count: 2 }), '2 nails');
      });

      it('rewritten "2" value', function () {
        var b = new BabelFish('en');
        b.addPhrase('en', 'test', '((=2 two nails|#{count} nail|#{count} nails))');

        assert.equal(b.t('en', 'test', { count: 0 }), '0 nails');
        assert.equal(b.t('en', 'test', { count: 1 }), '1 nail');
        assert.equal(b.t('en', 'test', { count: 2 }), 'two nails');
      });

      it('rewritten zero form with param', function () {
        var b = new BabelFish('en');
        b.addPhrase('en', 'test', '((=0 no nails [#{count}]|#{count} nail|#{count} nails))');

        assert.equal(b.t('en', 'test', { count: 0 }), 'no nails [0]');
      });
    });

  });


  describe('Flatten checks', function () {
    var data = {
      foo: {
        bar: 3,
        baz: {
          bad: 4
        }
      }
    };

    it('default flatten', function () {
      var b = new BabelFish('en');

      b.addPhrase('en', 'test', data);
      assert.equal(b.hasPhrase('en', 'test.foo'), false);
      assert.equal(b.hasPhrase('en', 'test.foo.bar'), true);
      assert.equal(b.hasPhrase('en', 'test.foo.baz'), false);
      assert.equal(b.hasPhrase('en', 'test.foo.baz.bad'), true);
    });

    it('flatten level 0', function () {
      var b = new BabelFish('en');

      b.addPhrase('en', 'test', data, 0);
      assert.equal(b.hasPhrase('en', 'test'), true);
      assert.equal(b.hasPhrase('en', 'test.foo'), false);
      assert.equal(b.hasPhrase('en', 'test.foo.bar'), false);
      assert.equal(b.hasPhrase('en', 'test.foo.baz'), false);
      assert.equal(b.hasPhrase('en', 'test.foo.baz.bad'), false);
    });

    it('flatten level 1', function () {
      var b = new BabelFish('en');

      b.addPhrase('en', 'test', data, 1);
      assert.equal(b.hasPhrase('en', 'test.foo'), true);
      assert.equal(b.hasPhrase('en', 'test.foo.bar'), false);
      assert.equal(b.hasPhrase('en', 'test.foo.baz'), false);
      assert.equal(b.hasPhrase('en', 'test.foo.baz.bad'), false);
    });

    it('flatten level 2', function () {
      var b = new BabelFish('en');

      b.addPhrase('en', 'test', data, 2);
      assert.equal(b.hasPhrase('en', 'test.foo'), false);
      assert.equal(b.hasPhrase('en', 'test.foo.bar'), true);
      assert.equal(b.hasPhrase('en', 'test.foo.baz'), true);
      assert.equal(b.hasPhrase('en', 'test.foo.baz.bad'), false);
    });

    it('flatten level 3', function () {
      var b = new BabelFish('en');

      b.addPhrase('en', 'test', data, 3);
      assert.equal(b.hasPhrase('en', 'test.foo'), false);
      assert.equal(b.hasPhrase('en', 'test.foo.bar'), true);
      assert.equal(b.hasPhrase('en', 'test.foo.baz'), false);
      assert.equal(b.hasPhrase('en', 'test.foo.baz.bad'), true);
    });

  });


  describe('Serialization', function () {
    var b = new BabelFish('en');
    b.addPhrase('en', 'string', 'test');
    b.addPhrase('en', 'number', 123);
    b.addPhrase('ru', 'object', { foo: 'bar' }, 0);

    var data_ru = {
      en: {
        string: 'test',
        number: 123
      },
      ru: {
        object: { foo: 'bar' }
      }
    };

    var data_en = {
      en: {
        string: 'test',
        number: 123
      }
    };

    it('stringify', function() {
      assert.deepEqual(JSON.parse(b.stringify('ru')).locales, data_ru);
      assert.deepEqual(JSON.parse(b.stringify('en')).locales, data_en);
    });

    it('load', function() {
      var b_new = new BabelFish('en');
      b_new.load(b.stringify('ru'));
      assert.deepEqual(JSON.parse(b_new.stringify('ru')).locales, data_ru);

      b_new = new BabelFish('en');
      b_new.load(b.stringify('en'));
      assert.deepEqual(JSON.parse(b_new.stringify('en')).locales, data_en);
    });
  });

});
