function abTestManager() {
    const tests = new Map();
    const runnedTests = [];
    const localStorageItemName = 'ab-test-manager';
    const validateOptions = (options) => {
        const { id, variants } = options;
        if (!id) {
            throw new Error('A test ID is required');
        }
        if (!variants || variants.length < 2) {
            throw new Error('A test must have at least 2 variants');
        }
        variants.forEach((variant) => {
            const { name, slug } = variant;
            if (!name) {
                throw new Error('A variant must have a name');
            }
            if (!slug) {
                throw new Error('A variant must have a slug');
            }
        });
    };
    const getCurrentTimestamp = () => new Date().getTime();
    const getTimestampForFutureExpiration = () => getCurrentTimestamp() + (365 * 24 * 60 * 60 * 1000);
    const getSavedVariants = () => {
        let savedValue = {};
        const localStorageValue = localStorage.getItem(localStorageItemName);
        if (localStorageValue) {
            try {
                savedValue = JSON.parse(localStorageValue);
            }
            catch (error) {
                console.error(error);
                localStorage.removeItem(localStorageItemName);
            }
            const currentTime = getCurrentTimestamp();
            try {
                const filteredVariants = Object.values(savedValue).filter((variant) => variant.expiration > currentTime);
                if (filteredVariants.length !== Object.values(savedValue).length) {
                    savedValue = {};
                    filteredVariants.forEach((variant) => {
                        savedValue[variant.testId] = variant;
                    });
                }
            }
            catch (error) {
                savedValue = {};
                console.error(error);
                localStorage.removeItem(localStorageItemName);
            }
        }
        return Object.values(savedValue).length > 0 ? savedValue : {};
    };
    const saveVariant = (testId, variantSlug) => {
        const savedVariants = getSavedVariants();
        const expiration = getTimestampForFutureExpiration();
        const newSavedVariant = { testId, variantSlug, expiration };
        savedVariants[testId] = newSavedVariant;
        localStorage.setItem(localStorageItemName, JSON.stringify(savedVariants));
    };
    const getSavedVariant = (testId) => {
        const savedVariants = getSavedVariants();
        const savedVariant = savedVariants[testId];
        return savedVariant ? savedVariant.variantSlug : false;
    };
    const register = (options) => {
        // combine options with defaults
        options = Object.assign({ debug: false, useDataLayer: true }, options);
        // If current URL has parameter ?ab-test-debug, enable debug mode
        const urlParams = new URLSearchParams(window.location.search);
        const debugByParam = urlParams.get('ab-test-debug');
        if (debugByParam) {
            options.debug = true;
        }
        validateOptions(options);
        tests.set(options.id, options);
        if (options.debug) {
            const baseURL = window.location.href.split('?')[0];
            const variantRegistrations = options.variants.map((variant) => `| Variant: ${variant.name} (slug: ${variant.slug}) => ${baseURL}?ab-test=${options.id}&ab-variant=${variant.slug}`);
            console.log(`🧑‍⚕️ [${options.id}]: Test registered: ${options.name}`, ...variantRegistrations);
        }
    };
    const deleteSavedVariant = (testId) => {
        const savedVariants = getSavedVariants();
        delete savedVariants[testId];
        localStorage.setItem(localStorageItemName, JSON.stringify(savedVariants));
    };
    const run = (id) => {
        const test = tests.get(id);
        if (!test) {
            console.log(`🧑‍⚕️ [${id}] No test by id`);
            return;
        }
        const { variants, debug, onBeforeRun, onAfterRun, useDataLayer, dataLayerEventName } = test;
        let selectedVariant;
        /**
         * Option 1: Allow user to specify a variant via URL parameter ?ab-test=id&ab-variant=slug
         */
        const urlParams = new URLSearchParams(window.location.search);
        const urlId = urlParams.get('ab-test');
        const urlVariant = urlParams.get('ab-variant');
        if (urlId === id && urlVariant) {
            const variantByURL = variants.find((variant) => variant.slug === urlVariant);
            if (variantByURL) {
                selectedVariant = variantByURL;
                debug && console.log(`🧑‍⚕️ [${id}] Variant chosen by URL parameter: ${selectedVariant === null || selectedVariant === void 0 ? void 0 : selectedVariant.name}`);
            }
        }
        /**
         * Option 2: Check for a local storage
         */
        if (!selectedVariant) {
            const savedVariant = getSavedVariant(id);
            if (savedVariant) {
                const variantByLocalStorage = variants.find((variant) => variant.slug === savedVariant);
                if (variantByLocalStorage) {
                    selectedVariant = variantByLocalStorage;
                    debug && console.log(`🧑‍⚕️ [${id}] Variant chosen by local storage: ${selectedVariant === null || selectedVariant === void 0 ? void 0 : selectedVariant.name}`);
                }
            }
        }
        /**
         * Option 3: Randomly select a variant
         */
        if (!selectedVariant) {
            const index = Math.floor(Math.random() * variants.length);
            selectedVariant = variants[index];
            saveVariant(id, selectedVariant.slug);
            debug && console.log(`🧑‍⚕️ [${id}] Variant randomly chosen: ${selectedVariant === null || selectedVariant === void 0 ? void 0 : selectedVariant.name}`);
        }
        /**
         * Warning on multiple runs
         */
        if (runnedTests.includes(id)) {
            debug && console.warn(`🧑‍⚕️ [${id}] Multiplte runs of test`);
        }
        /**
         * Run the test
         */
        if (!selectedVariant) {
            console.log(`🧑‍⚕️ [${id}] No variant selected for test`);
            return;
        }
        debug && console.log(`🧑‍⚕️ [${id}] Running...`);
        onBeforeRun && onBeforeRun(selectedVariant);
        if (typeof selectedVariant.onRun === 'function') {
            selectedVariant.onRun();
        }
        onAfterRun && onAfterRun(selectedVariant);
        // add test to runned tests
        runnedTests.push(id);
        /**
         * Data layer push
         */
        if (useDataLayer) {
            const event = {
                event: dataLayerEventName || 'ABTest',
                testId: id,
                testName: test.name,
                variantSlug: selectedVariant.slug,
                variantName: selectedVariant.name,
            };
            debug && console.log(`🧑‍⚕️ [${id}] Pushing data layer...`, event);
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push(event);
        }
        debug && console.log(`🧑‍⚕️ [${id}] Ready`);
    };
    return {
        register,
        run,
        deleteSavedVariant,
    };
}

export { abTestManager };
