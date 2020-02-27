import { writable, derived } from 'svelte/store';

import * as validators from 'types-validate-assert'
const { validateTypes } = validators; 

//import { defualtSettingsStore } from './defaults'

import { isSettingsStoreObj,  isPageInfoObj} from '../objectValidations';

const defualtSettingsStore = {
    'currentPage' : {'name': 'FirstRunMain', 'data' : {}},
    'firstRun': true,
    'themeStyle':'dark',
    'version':'v0_9_8',
    'storage' : {'used': 0, 'remaining': 5000000, 'max': 5000000}
}

const createSettingsStore = () => {
    let startValue = defualtSettingsStore
    let initialized = false;

    function getStore(){
        //Set the Coinstore to the value of the local storage
        chrome.storage.local.get({"settings": startValue}, function(getValue) {
            initialized = true;
            SettingsStore.set(getValue.settings)
        });
    }

    //Create Intial Store
    const SettingsStore = writable(startValue);

    //This is called everytime the CoinStore updated
    SettingsStore.subscribe(current => {
        //Only accept and Array Object to be saved to the storage and only
        //if store has already been initialized
        if (!initialized) {
            return current
        }
        if (isSettingsStoreObj(current)){
            chrome.storage.local.set({"settings": current});
        }else{
            //Recover store value in memory to previous local storage value
            getStore();
            console.log('Recovered from bad Settings Store Value');
        }
    });

    chrome.storage.onChanged.addListener(function(changes, namespace) {
        for (let key in changes) {
            if (key === 'settings') SettingsStore.set(changes[key].newValue)
        }
    });

    //Set the Coinstore to the value of the local storage
    getStore()

    let subscribe = SettingsStore.subscribe;
    let update = SettingsStore.update;
    let set = SettingsStore.set;

    return {
        subscribe,
        set,
        update,
        //Store that the first run setup has been completed
        firstRunComplete: () => {
            SettingsStore.update(settingsStore => {
                settingsStore.firstRun = false;
                settingsStore.currentPage = {name: 'CoinsMain', data: {}};
                return settingsStore;
            })
        },
        //Change the current page of the app
        //an also accept a data package the new page may need;
        changePage: (pageInfoObj) => {
            //Return if the object isn't a proper page object
            if (!isPageInfoObj(pageInfoObj)) return;
            //Default data to empty object
            if (!pageInfoObj.data) pageInfoObj.data = {};
            SettingsStore.update(settingsStore => {
                //Set name and data in Settings store
                settingsStore.currentPage = pageInfoObj;
                return settingsStore;
            })
        },
        //Set a new theme in the setting store
        changeTheme: (theme) => {
            //Reject undefined or missing info.
            if (!validateTypes.isStringWithValue(theme)) return;
            SettingsStore.update(settingsStore => {
                //Set theme in Settings store
                settingsStore.themeStyle = theme;
                return settingsStore;
            })
        },
        //Calculates the amount of local storage used and remaining
        calcStorage: () => {
            SettingsStore.update(settings => {
                settings.storage.used = new Blob(Object.values(localStorage)).size;
                settings.storage.remaining = settings.storage.max - settings.storage.used;
                return settings;
            })   
        }
    };
}

//Settings Stores
export const SettingsStore = createSettingsStore();

//Derived Store to return the current page object
export const currentPage = derived(
	SettingsStore,
	$SettingsStore => { return $SettingsStore.currentPage }
);

//Derived Store to return the themeStyle
export const themeStyle = derived(
	SettingsStore,
	$SettingsStore => { return $SettingsStore.themeStyle }
);

//Derived Store to return the storageInfo Object
export const storageInfo = derived(
	SettingsStore,
	$SettingsStore => { return $SettingsStore.storage }
);