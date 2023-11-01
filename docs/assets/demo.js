import { abTestManager } from '../dist/ab-testing-toolkit.esm.js';

(function () {
	const init = () => {
		const demoId = document.body.getAttribute('data-demo');

		switch (demoId) {
			case 'basic':
				demoBasic();
				break;
			case 'trigger':
				demoTrigger();
				break;
			default:
				throw new Error(`No matching demo found. Demo ID: ${demoId}`);
		}

		document.addEventListener('DOMContentLoaded', () => {
			const buttonsToResetSaved = document.querySelectorAll('.js-reset-saved-and-refresh');
			buttonsToResetSaved.forEach((button) => {
				button.addEventListener('click', () => {
					// remove saved variant from local storage
					localStorage.removeItem('ab-test-manager');
					// remove query parameters and reload
					const url = window.location.href.split('?')[0];
					window.history.replaceState({}, document.title, url);
					window.location.reload();
				});
			});
		});

	};

	const demoBasic = () => {
		const abTest = abTestManager();
		abTest.register({
			id: 'demo-basic',
			name: 'Basic Demo',
			debug: true,
			variants: [
				{
					slug: 'variant-a',
					name: 'Variant A',
					onRun: () => {
						document.getElementById('demo-basic').innerHTML = 'Variant A chosen';
					},
				},
				{
					slug: 'variant-b',
					name: 'Variant B',
					onRun: () => {
						document.getElementById('demo-basic').innerHTML = 'Variant B chosen';
					},
				},
			]
		});
		abTest.run('demo-basic');
	};

	const demoTrigger = () => {
		const abTest = abTestManager();

		abTest.register({
			id: 'demo-trigger',
			name: 'Trigger Demo',
			debug: true,
			variants: [
				{
					slug: 'variant-a',
					name: 'Variant A',
					onRun: () => {
						document.getElementById('demo-trigger').innerHTML = 'Variant A chosen';
					},
				},
				{
					slug: 'variant-b',
					name: 'Variant B',
					onRun: () => {
						document.getElementById('demo-trigger').innerHTML = 'Variant B chosen';
					},
				},
			]
		});

		const triggerButton = document.querySelector('.js-trigger-ab-test');
		if (triggerButton) {
			triggerButton.addEventListener('click', () => {
				abTest.run('demo-trigger');
			});
		}
	};

	init();
})();
