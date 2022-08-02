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

import * as webdav from 'webdav'
import axios from '@nextcloud/axios'
import memoize from 'lodash/fp/memoize'
import uniqBy from 'lodash/uniqBy'
import { generateRemoteUrl, generateUrl } from '@nextcloud/router'
import { getCurrentUser } from '@nextcloud/auth'

export default class SearchEngine {

	constructor(currentFolder) {
		console.log(`advanced_search: Initializing search engine with root folder "${currentFolder}"`)
		this.currentFolder = currentFolder
		this.domParser = new DOMParser()
		this.webdavClient = this._createWebdavClient()
	}

	// Creates a Webdav client for the current NC session
	// It is used to search for files by title and tag
	_createWebdavClient = memoize(() => {
		// Add this so the server knows it is an request from the browser
		axios.defaults.headers['X-Requested-With'] = 'XMLHttpRequest'

		// force our axios
		const patcher = webdav.getPatcher()
		patcher.patch('request', axios)

		const webdavClient = webdav.createClient(
			generateRemoteUrl('dav/'),
			{
				headers: {
					'content-Type': 'text/xml'
				},
			}
		)

		return webdavClient
	})

	// Gets result files from a webdav result
	_getResultsFromWebdav(webdavResult) {

		const files = []

		// Find files in results
		var xml = this.domParser.parseFromString(webdavResult.data, 'text/xml')
		const responses = xml.evaluate('//d:response', xml, () => {return 'DAV:'}, XPathResult.ANY_TYPE, null)
		var response

		// Extract files info
		while ((response = responses.iterateNext()) !== null) {

			// Gets file name
			var props = xml.evaluate('.//d:href', response, () => {return 'DAV:'}, XPathResult.ANY_TYPE, null)
			var prop = props.iterateNext()
			const filePath = prop.textContent
			const path = `/remote.php/dav/files/${getCurrentUser().uid}`
			const regex = new RegExp(path)
			var name = filePath.replace(regex,'')

			// Keeps only the files in the current folder and its subfolders
			if (name.startsWith(this.currentFolder)) {

				props = xml.evaluate('.//d:getlastmodified', response, () => {return 'DAV:'}, XPathResult.ANY_TYPE, null)
				prop = props.iterateNext()
				const lastmodified = prop.textContent

				props = xml.evaluate('.//oc:fileid', response, () => {return 'http://owncloud.org/ns'}, XPathResult.ANY_TYPE, null)
				prop = props.iterateNext()
				const id = prop.textContent

				props =  xml.evaluate('.//oc:size', response, () => {return 'http://owncloud.org/ns'}, XPathResult.ANY_TYPE, null)
				prop = props.iterateNext()
				const size = prop.textContent

				name = name.replace(this.currentFolder, '')
				files.push({
					name: name.startsWith('/') ? decodeURI(name.substring(1)) : decodeURI(name),
					id,
					size,
					lastmodified
				})
			}
		}

		return files
	}

	// Gets result files from a jSON result (for fulltext search)
	_getResultsFromJSON(result) {

		const files = []

		result.data.result[0].documents.forEach(document => {

			if (document.info.dir.startsWith(this.currentFolder)) {
				const regex = new RegExp(this.currentFolder)
				const name = document.info.path.replace(regex,'')
				files.push({
					name: name.startsWith('/') ? name.substring(1) : name,
					id: document.id,
					size: document.info.size,
					lastmodified: new Date(document.info.mtime * 1000 ).toString(),
				})
			}
		})

		return files
	}

	// Executes queries and processes the results
	// Returns a promise that resolves to an array of matching files
	async _executeQueries(queries, anySearch = false, webdavSearch = true) {

		const resultFiles = []
		return Promise.all(queries.map(query => query.lookup)).then((results) => {

			console.log('advanced_search: All server requests of a subquery have been served, processing results')

			// Gets results from responses
			results.forEach(result => {
				if (webdavSearch) {
					resultFiles.push(this._getResultsFromWebdav(result))
				} else {
					resultFiles.push(this._getResultsFromJSON(result))
				}

			})

			// Combines matching files with AND or OR criteria, and remember negative results for later processing
			var matchingFiles = []
			var negativeFiles = []
			for (var i = 0; i < resultFiles.length; i++) {

				const subresults = resultFiles[i]

				console.log(`advanced_search: processing results for query ${i}`, queries[i])
				console.log('advanced_search: results are:', subresults)
				if (anySearch === 'any') {
					// All files shall be kept
					matchingFiles = uniqBy([
						...matchingFiles,
						...subresults,
					], 'id')
				} else {
					if (queries[i].negate) {
						// matching files should be removed from the search result
						negativeFiles =  [...negativeFiles, ...subresults]
					} else {
						// Only those files that have a match in all queries
						if (subresults.length === 0) {
							// No files were returned for this query, so we can end the work directly
							return []
						} else if (matchingFiles.length === 0) {
							// Initialization (we are processing the first query)
							matchingFiles = subresults
						} else {
							// Keeping only those files that have a match in all queries
							matchingFiles = matchingFiles.filter(file => {
								const fileIds = subresults.map(file => file.id)
								return fileIds.includes(file.id)
							})
						}
					}
				}

			}

			// Removes negative results from the results
			matchingFiles =matchingFiles =  matchingFiles.filter(file =>{
				const fileIds = negativeFiles.map(file => file.id)
				return !fileIds.includes(file.id)
			})

			return matchingFiles

		})


	}

	// Search for files based on tokens in their content
	async searchInContent(tokens, anySearch) {

		const queries = []
		tokens.forEach(token => {

			// Initialises the query
			const query = {
				negate: false,
				lookup: {},
			}

			// Finds out if it's a negative search
			if (token.startsWith('-')) {
				query.negate = true
				token = token.substring(1)
			}

			// Creates query and saves it
			const request = { providers: 'files', search: token }
			query.lookup = axios.get(generateUrl(`/apps/fulltextsearch/v1/remote?request=${JSON.stringify(request)}`)).then((result) => result)
			queries.push(query)
		})

		// Executes queries, process results, and return matching files
		return this._executeQueries(queries, anySearch, false)
	}

	// Search for files matching the provided tags
	async searchByTags(tagsQueried, anySearch = false) {

		// Loads system tags collection if not yet done
		if (!OC.SystemTags.collection.fetched) {
			await OC.SystemTags.collection.fetch()
		}

		// Creates an array of async queries to be executed in parallel
		const queries = []
		tagsQueried.forEach(tagQueried => {

			// Initialises the query
			const query = {
				negate: false,
				lookup: {},
			}

			// Finds out if it's a negative search
			if (tagQueried.startsWith('-')) {
				query.negate = true
				tagQueried = tagQueried.substring(1)
			}

			// Get all tags matching tagQueried
			const results = OC.SystemTags.collection.filterByName(tagQueried)
			const tags = _.invoke(results, 'toJSON')

			// Creates a query only for the tags matching tagQueried (if any)
			tags.forEach(tag => {
				if (tag.name === tagQueried) {
					query.lookup = this.webdavClient.customRequest(`/files/${getCurrentUser().uid}`, {
						method: "REPORT",
						data: `<oc:filter-files  xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns" xmlns:nc="http://nextcloud.org/ns" xmlns:ocs="http://open-collaboration-services.org/ns">
								<d:prop>
									<oc:fileid/>
									<d:getlastmodified/>
									<oc:size/>
								</d:prop>
								<oc:filter-rules>
									<oc:systemtag>${tag.id}</oc:systemtag>
								</oc:filter-rules>
							</oc:filter-files>`
					})
					queries.push(query)
				}
			})

		})

		// Executes queries, process results, and return matching files
		return this._executeQueries(queries, anySearch, true)

	}

	// Searches for files whose name matches the provided tokens 
	// The function already resrticts the search to files in the current folder and subfolders
	// although it is later filtered again in this._executeQueries
	async searchByTitles(tokens, anySearch = false) {

		// Creates an array of async queries to be executed in parallel
		const queries = [] 
		tokens.forEach(token => {

			const query = {
				negate: false,
				lookup: {},
			}

			if (token.startsWith('-')) {
				query.negate = true
				token = token.substring(1)
			}

			query.lookup = this.webdavClient.customRequest('/', {
				method: "SEARCH",
				data: `<?xml version="1.0" encoding="UTF-8"?>
				<d:searchrequest xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns">
					<d:basicsearch>
						<d:select>
							<d:prop>
								<oc:fileid/>
								<d:getlastmodified/>
								<oc:size/>
							</d:prop>
						</d:select>
						<d:from>
							<d:scope>
								<d:href>/files/${getCurrentUser().uid}/${this.currentFolder}</d:href>
								<d:depth>infinity</d:depth>
							</d:scope>
						</d:from>
						<d:where>
							<d:like>
								<d:prop>
									<d:displayname/>
								</d:prop>
								<d:literal>%${token}%</d:literal>
							</d:like>
						</d:where>
						<d:orderby>
							<d:prop>
								<oc:size/>
							</d:prop>
							<d:ascending/>
						</d:orderby>
					</d:basicsearch>
				</d:searchrequest>`
			})

			queries.push(query)

		})

		// Executes queries, process results, and return matching files
		return this._executeQueries(queries, anySearch, true)

	}

	// Executes the searches related a queryObject
	async _executeQueryObject(queryObject, anySearch) {

		const promises = []
		var promise

		// Transforms each subquery into a promise that will resolve when all the corresponding server queries will be done
		if (queryObject['type'] === 'normal' || anySearch) {
			// Normal search
			if (queryObject['modifier'] === 'tag') {
				console.log(`advanced_search: Registering a searchByTags query for terms "${queryObject['subqueries'].join(',')}"`)
				promise = this.searchByTags(queryObject['subqueries'], queryObject['type'])
			} else if (queryObject['modifier'] === 'title') {
				console.log(`advanced_search: Registering a searchByTitles query for terms "${queryObject['subqueries'].join(',')}"`)
				promise = this.searchByTitles(queryObject['subqueries'], queryObject['type'])
			} else {
				if (_oc_appswebroots.hasOwnProperty('files_fulltextsearch')
				    && _oc_appswebroots.hasOwnProperty('fulltextsearch')
				    && _oc_appswebroots.hasOwnProperty('fulltextsearch_elasticsearch')) {
					console.log(`advanced_search: Registering a searchInContent query for terms "${queryObject['subqueries'].join(',')}"`)
					promise = this.searchInContent(queryObject['subqueries'], queryObject['type'])
				} else {
					// fulltextsearch not enabled, registering a dummy promise returning an empty array as if a search had took place and returned no result
					// We can do that without problem because content searches are always in any searches (so an empty result here won't result in an empty 
					// global result)
					console.log(`advanced_search: Not all fulltextsearch plugins are enabled, skipping a searchInContent query for terms "${queryObject['subqueries'].join(',')}" (The following plugins need to be enabled: fulltextsearch, fulltextsearch_elasticsearch, and files_fulltextsearch)`)
					promise = new Promise((resolve, reject) => { resolve([]) })
				}
			}

			promises.push(promise)

		} else {
			// Any search, enters recursivity
			console.log('advanced_search: Executing new query objects for an any search')
			queryObject['subqueries'].forEach(subquery => {
				promises.push(this._executeQueryObject(subquery, queryObject['type']))
			})

		}

		// Returns a promise that resolves when all the subquery promises resolve.
		// The promise resolves to a list of files that match all the criteria of this queryObject
		return Promise.all(promises).then(files => {

			console.log(`advanced_search: All subquery promises of a queryObject have been resolved, combining results according to the queryObject's type (${queryObject['type']})`)

			// No results
			if (typeof files[0] === 'undefined') {
				return
			}

			// Combines matching files with AND or OR criteria 
			var matchingFiles = []
			files.forEach(subresults => {
				if (queryObject['type'] === 'any') {
					// All files shall be kept
					matchingFiles = uniqBy([
						...matchingFiles,
						...subresults,
					], 'id')
				} else {
					// Only those files that match in all the subqueries shall be kept
					if (subresults.length === 0) {
						// No files matched this subquery, so we can end the work directly
						return []
					} else if (matchingFiles.length === 0) {
						// Initialization (we are processing the first subquery provided)
						matchingFiles = subresults
					} else {
						// Keeping only those files that match all subqueries
						matchingFiles = matchingFiles.filter(file => {
							const fileIds = subresults.map(file => file.id)
							return fileIds.includes(file.id)
						})
					}
				}
			})

			return matchingFiles

		})

	}

	// Searches files according to queryObjects 
	// "queryObjects" should be an array returned by a QueryParser.getQueryObjects() function
	async searchFiles(queryObjects) {

		console.log('advanced_search: searching for files based on following queryObjects', queryObjects)

		// Each queryObject is transformed into a promise that resolves when all its subqueries get resolved
		const promises = []
		queryObjects.forEach(queryObject => {
			promises.push(this._executeQueryObject(queryObject, false))
		})

		// Process results when all promises are resolved
		const result = await Promise.all(promises).then((results) => {

			console.log('advanced_search: all queryObject promises have resolved, combining results')
			if (typeof results[0] !== 'undefined') {

				// Combining results, and remember negative results for later removal
				var matchingFiles = []
				var negativeFiles = []
				for (var i = 0; i < results.length; i++) {

					console.log(`advanced_search: processing results for queryObject ${i}`, queryObjects[i])
					console.log('advanced_search: results are:', results[i])
					const subresults = results[i]
					if (queryObjects[i].negate) {
						// matching files should be removed from the search result
						negativeFiles =  [...negativeFiles, ...subresults]
					} else {
						// Only those files that have been found in all queries shall be kept
						if (subresults.length === 0) {
							// A query returned no files, so we can end the work directly
							return {
								status: 'ok',
								files: [],
							}
						} else if (matchingFiles.length === 0) {
							// Initialization (we are processing the first query)
							matchingFiles = subresults
						} else {
							// Keeping only those files that match all queries
							matchingFiles = matchingFiles.filter(file => {
								const fileIds = subresults.map(file => file.id)
								return fileIds.includes(file.id)
							})
						}
					}
				}

				// Removes negative results from the results
				matchingFiles =  matchingFiles.filter(file =>{
					const fileIds = negativeFiles.map(file => file.id)
					return !fileIds.includes(file.id)
				})

				return {
					status: 'ok',
					files: matchingFiles?.flat(),
				}

			} else {
				return {
					status: 'ok',
					files: [],
				}
			}

		}).catch((error) => {
			return {
				status: 'error',
				error,
			}

		})

		console.log('advanced_search: results combined, returning the following files', result)
		return result
	}

}
