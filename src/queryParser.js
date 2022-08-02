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

// A class dedicated to parse query strings and return objects usable by the searchEngine
export default class QueryParser {

	constructor(query = '') {
		this.query = query
		this.queryObjects = []
	}

	// Creates query objects from the loaded query
	_createQueryObjects(query, anySearch = false) {
		
		const queryObjects = []
		const subqueriesArray = query.split(/(-?any:|-?tag:|-?title:|,)/)

		// Preprocessing the subqueriesArray, removing leftovers from the split, and combining back
		// array members that are parts of the same 'any' query
		const preprocessedSubqueriesArray = []
		for (var i = 0; i < subqueriesArray.length; i++) {

			var subqueryString = subqueriesArray[i].trim()

			// subqueryString is just a leftover from the split, just forget it
			if (subqueryString === '') {
					continue
			}

			// A comma without a previous 'any' subqueryString doesn't serve any purpose
			if (subqueryString === ',') {
					continue
			}

			// if subqueryString indicates the start of an 'any' block, the next subquerriesArray members 
			// must be combined together, until the next comma
			if (subqueryString.startsWith('any:') || subqueryString.startsWith('-any:')) {

				preprocessedSubqueriesArray.push(subqueryString)

				var combinedAnySubquery = ''
				while (subqueriesArray[++i] !== ',' && i < subqueriesArray.length) {
					combinedAnySubquery += subqueriesArray[i]
				}

				subqueryString = combinedAnySubquery

			}

			preprocessedSubqueriesArray.push(subqueryString)

		}

		// Variables to keep track of a queryObject's properties
		var type = anySearch ? 'any' : 'normal'
		var modifier = ''
		var negate = false
		preprocessedSubqueriesArray.forEach(subqueryString => {

			// Initializes a standard queryObject corresponding to the most basic search.
			// It's properties will be changed later if needed.
			var queryObject = {
				'type': type,
				'modifier': modifier,
				'negate': negate,
				'subqueries': []
			}

			subqueryString = subqueryString.trim()

			// Next subqueryString will relate to an 'any' search
			if (subqueryString.startsWith('any:') || subqueryString.startsWith('-any:')) {
				if (type === 'any') {
					// Error, can't have an 'any' search within an 'any' search
					// TODO: Handle it properly (maybe just ignore?)
				} else {
					type = 'any'
					if (subqueryString.startsWith('-')) {
						negate = true
					}
					return
				}
			}

			// subqueryString is a search modifier for the next subqueryString
			// Note that subqueryStrings that relate to an 'any' search don't sperate 'tag:' and 'title:' from their search terms yet,
			// so we don't directly continue with the next subqueryString in this case
			if (type !== 'any' || anySearch) {
				if (subqueryString.startsWith('tag:') || subqueryString.startsWith('-tag:')) {
					modifier = 'tag'
					if (subqueryString.startsWith('-')) {
						negate = true
					}
					return
				} else if (subqueryString.startsWith('title:') || subqueryString.startsWith('-title:')) {
					modifier = 'title'
					if (subqueryString.startsWith('-')) {
						negate = true
					}
					return
				}
			}

			// We have reached a subqueryString that actually contains search terms to be looked up.
			// The query object will thus ends after this subqueryString and we can now update its properties 
			queryObject.modifier = modifier
			queryObject.negate = negate
			queryObject.subqueries = (type === 'any' && !anySearch) ? this._createQueryObjects(subqueryString, true) : this._getSubqueryTokens(subqueryString)

			// When there's no modifier, the searchEngine will have to search on content, tag, and title.
			// So, in this case we transform the queryObject created in several queryObjects for these content, tag, and title searches 
			if (modifier === '' && (type === 'normal' || anySearch)) {
				if (type === 'normal') {
					// We are in a normal search, so we have to transform it to 1 any search for each token searched
					queryObject.subqueries.forEach(token => {
						var newQueryObject = {
							type: 'any',
							modifier: '',
							negate: false,
							subqueries: []
						}
						if (token.startsWith('-')) {
							newQueryObject.negate = true
							token = token.substring(1)
						}
	
						var subquery = {
							type: 'normal',
							modifier: 'content',
							negate: false,
							subqueries: [token]
						}	
						newQueryObject.subqueries.push(subquery)
						newQueryObject.subqueries.push({...subquery,...{modifier: 'tag'}})
						newQueryObject.subqueries.push({...subquery,...{modifier: 'title'}})
						queryObjects.push(newQueryObject)
					})
				} else {
					// We are already in an any search, so we may simply add 1 content, 1 tag, and 1 title search for all tokens at once
					queryObject.type = 'any'
					queryObject.modifier = 'content'
					queryObjects.push(queryObject)
					queryObjects.push({...queryObject,...{modifier: 'tag'}})
					queryObjects.push({...queryObject,...{modifier: 'title'}})
				}
			} else {
				queryObjects.push(queryObject)
			}

			// Resets the variables since we will start a new queryObject
			type = anySearch ? 'any' : 'normal'
			modifier = ''
			negate = false

		})

		return queryObjects

	}
	
	_getSubqueryTokens(subqueryString) {

		const tokens = []

		while (subqueryString.length > 0) {

			var token
			if (subqueryString.startsWith('"')) {
				const idx = subqueryString.indexOf('"',1)
				if (idx === -1) {
					// End of the subqueryString
					token = subqueryString
					subqueryString = ''
				} else {
					token = subqueryString.substring(0, idx + 1).trim()
					subqueryString = subqueryString.substring(idx + 1)
				}
			} else {
				const idx = subqueryString.indexOf(' ',1)
				if (idx === -1) {
					// End of the subqueryString
					token = subqueryString
					subqueryString = ''
				} else {
					token = subqueryString.substring(0, idx + 1).trim()
					subqueryString = subqueryString.substring(idx + 1)
				}
			}

			tokens.push(token)

		}

		return tokens

	}

	loadQuery(query) {
		console.log(`loading query "${query}"`)
		this.query = query
		this.queryObjects = []
	}

	getQueryObjects() {
		
		// Create query objects from the loaded query
		this.queryObjects = this._createQueryObjects(this.query)

		return this.queryObjects

	}

}
