# A/B Testing Toolkit

This is a JavaScript tool for A/B testing. You can register tests, split visitors automatically evenly for variants and send events via Data Layer for example to Google Analytics. This library doesn't track data itself and only saves user's showed variants to their browser's local storage.

Note that under GDPR and similar laws running A/B testing might require user's consent. This library doesn't handle consent and you need to handle it yourself before running tests.

## Demos

* [A/B Test on Page Load](https://evermade.github.io/ab-testing-toolkit/)
* [A/B Test on Custom Trigger](https://evermade.github.io/ab-testing-toolkit/trigger.html)

### Usage

If you’re using a bundler (such as Webpack or Rollup), you can install through npm:

```bash
npm install @evermade/ab-testing-toolkit
```

Import the `abTestManager`, register and run tests.

```js
import { abTestManager } from "@evermade/ab-testing-toolkit

const abTest = abTestManager();

abTest.register({
	id: '2023-11-new-header-cta',
	name: 'Change color of header CTA',
	debug: true, // show console logs
	variants: [
		{
			slug: 'a-original',
			name: 'A: Original',
			onRun: () => {},
		},
		{
			slug: 'variant-b',
			name: 'B: New CTA button color',
			onRun: () => {
				// apply variant changes for example via CSS classes, JS manipulation etc
				document.body.classList.add('is-ab-test-new-header-cta');
			},
		},
	]
});
abTest.run('2023-11-new-header-cta');
```

## Previewing your tests

You can verifify that your tests are working easiest by visiting the URLs that force theses variants to be shown. For example if you have test with ID `2023-11-new-header-cta` and variant with slug `variant-b` you can visit URL `/?ab-test={id}&ab-variant={slug}` to force variant to be shown.

You don't need to create these URLs manually. When you are running it on debug mode, these URLs are provided console.

You can run toolkit in debug at any point by registering test with `debug: true` or adding `?ab-test-debug` to your current URL.

## How variant is chosen

There are three ways to choose variant:

1. Variant is specified in URL `/?ab-test={id}&ab-variant={slug}`

2. Variant is saved in local storage

3. Variant is chosen randomly by splitting visitors evenly

## How variant is saved

Shown variant is saved to local storage with key `ab-test-manager`. All tests are saved under this singular key. Items here have expiration of one year so you don't need to write any clean-up code yourself.

If you want to clear all test data from your browser you can run `localStorage.removeItem('ab-test-manager')` in your browser's console or remove the item via inspector UI under Application.

Note that local storage data is only available at browser level so you cannot use this data for example in server side and will not affect your caching.

## Test data in Google Analytics

[To be added, in testing phase...]

## A/B testing and consent

### Cookie declaration

This library sets one key to local storage as `ab-test-manager` to save which variants are shown to user to ensure that user sees the same variant on every page load.

This library doesn't set any cookies itself but if you are using Google Analytics or other services that set cookies you need to declare them in your cookie declaration.

### Data tracking

This library doesn't track any data itself but if you are using Google Analytics or other services that track data you need to declare them in your cookie declaration and only run those services when user has given consent.

## Options

There are many settings (in object format) that can be passed as 2nd argument with following types:

```js
abTestManager.register({
	id: '2023-11-new-header-cta',
	name: 'Change color of header CTA',
	debug: true, // show console logs
	variants: [
		{
			slug: 'a-original',
			name: 'A: Original',
			onRun: () => {},
		},
		{
			slug: 'b-variant',
			name: 'B: Variant',
			onRun: () => {
				document.body.classList.add('is-ab-test-new-header-cta');
			},
			},
		},
	],
	useDataLayer: true,
	dataLayerEventName: 'abTestEvent',
	onBeforeRun: (variant) => {
		console.log('onBeforeRun', variant);
	},
	onAfterRun: (variant) => {
		console.log('onAfterRun', variant);
	},
});
```

### id (string)

URL friendly ID for test. This is used to save test data to local storage. Should be unique for each test and comprised of only letters, numbers and dashes.

### name (string)

Name of the test. This is used for example in console logs.

### debug (boolean)

Whether to display debugging console logs. Can be overridden by adding `?ab-test-debug` to current URL.

### variants (array)

The variants for the test. Each variant object can have following properties:

* `slug` (string) - URL friendly ID for variant. This is used to save variant data to local storage. Should be unique for each variant and comprised of only letters, numbers and dashes.
* `name` (string) - Name of the variant. This is used for example in console logs.
* `onRun` (function) - Function to be called when variant is run. This is where you should apply variant changes for example via CSS classes, JS manipulation etc.
ults to wrapping when href is "#".

### useDataLayer (boolean)

Whether to send events automatically to Data Layer. If you want to do completely different Data Layer event you can set this false and add your own into onAfterRun hook.

### dataLayerEventName (string)

Name of Data Layer event. Defaults to `ABTest`.

### onBeforeRun (function)

Function to be called before variant is run. Variant object is passed as argument.

```js
onBeforeRun: (variant) => {
	console.log('onBeforeRun', variant);
},
```

### onAfterRun (function)

Function to be called after variant is run. Variant object is passed as argument.

```js
onBeforeRun: (variant) => {
	console.log('onAfterRun', variant);
},
```

## Development

Install tools `npm install` and build `npm run build` or develop with `npm run watch`.

Releasing new version:

* Update version in `package.json`
* Commit to master
* Set tag with version number to git
* Create new release in GitHub
* NPM package is automatically published from GitHub
