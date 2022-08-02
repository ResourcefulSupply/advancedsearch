/**
 *
 * @author Cyrille Bollu <cyrpub@bollu.be>
 *
 * @license AGPL-3.0
 *
 * This code is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License, version 3,
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License, version 3,
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 *
 */

import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'
import { subscribe, unsubscribe } from '@nextcloud/event-bus'
import QueryParser from './queryParser'
import SearchEngine from './searchEngine'

// Search files based on the unified-search's query string and display the results
const startSearch = async function({query}) {

	console.log(`advanced_search: Starts searching for files`)

	// Passes info about the current query to the vuejs app
	store.commit('setQuery', query)

	// Gets query objects from the query string
	const queryParser = new QueryParser(query)
	const queryObjects = queryParser.getQueryObjects()

	// Do not start empty searches (eg: when unified-search 'string is 'title:')
	if (queryObjects.length === 0) {
		console.log(`advanced_search: queryObjects array is empty, aborting search`)
		return
	}

	// Gets the current folder from URL, to pass is to the search engine and to the vuejs app
	const queryString = window.location.search
	const urlParams = new URLSearchParams(queryString)
	const currentFolder = urlParams.get('dir')
	
	// Passes info about currentFolder to vuejs app
	store.commit('setCurrentFolder', currentFolder)

	// Searches for files based on the specification given by the query objects
	const searchEngine =  new SearchEngine(currentFolder)
	const results = await searchEngine.searchFiles(queryObjects)

	// Returns early in case of error during the search
	if (results.status === 'error') {
		console.log('advanced_search: Error during search', results.error)
		return
	}

	// Shows results
	if (results.files.length > 0) {
		console.log('advanced_search: Displaying results')
		store.commit('setFiles', results.files)
		// Hides regular files list and empty content
		originalTable.style.display = 'none'
		const emptyContent = document.getElementById("emptycontent");
		emptyContent.setAttribute("class", "hidden")
	} else {
		// No results, shows a modified empty content div
		console.log('advanced_search: No results')
		store.commit('setFiles', [])
		originalTable.style.display = 'none'
		const emptyContent = document.getElementById("emptycontent");
		const h2 = emptyContent.getElementsByTagName("h2")[0]
		noContentTextBackup = h2.innerHTML
		h2.innerHTML = "No files matched your query"
		emptyContent.setAttribute("class", "")
	}

}

// Displays regular files table and its footer back, and hides result table
const endSearch = function() {

	console.log('advanced_search: unified search field reset, restoring original files list')
	store.commit('setFiles', [])
	originalTable.getElementsByTagName("tfoot")[0].style.display = ''
	originalTable.style.display = ''
	const emptyContent = document.getElementById("emptycontent");
	const h2 = emptyContent.getElementsByTagName("h2")[0]
	h2.innerHTML = noContentTextBackup
	emptyContent.setAttribute("class", "hidden")

}

// Global variable to hold the regular emptycontent text ('Upload some content or sync with your devices!' in English)
var noContentTextBackup = ''

// Gets a reference to the regular files list
const originalTable = document.getElementById("filestable")

// Creates the div for the vuejs app and insert it before originalTable
const advancedSearchContent = document.createElement("div")
advancedSearchContent.setAttribute("id", "advanced-search")
const appContent = document.getElementById("app-content-files")
appContent.insertBefore(advancedSearchContent, originalTable)

// Subscribes to unified-search events
subscribe('nextcloud:unified-search.search', startSearch)
subscribe('nextcloud:unified-search.reset', endSearch)

// Creates Vuex store
Vue.use(Vuex)
const store = new Vuex.Store({
	state: {
		currentFolder: '',
		files: [],
		query: '',
	},
	mutations: {
		setCurrentFolder (state, currentFolder) {
			state.currentFolder = currentFolder
		},
		setFiles (state, files) {
			state.files = files
		},
		setQuery (state, query) {
			state.query = query
		},
	},
})

// Creates Vue app and attach it to '#advanced-search'
export default new Vue({
	el: '#advanced-search',
	store: store,
	render: (h) => h(App),
})
