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

import QueryParser from '../queryParser'

const queryParser = new QueryParser()
var query
var queryObjects = []

test('Query 5', () => {

	query = 'foo'
	queryParser.loadQuery(query)
	queryObjects = queryParser.getQueryObjects()
	expect(queryObjects).toStrictEqual([
		{
			type: 'any',
			modifier: '',
			negate: false,
			subqueries: [
				{
					type: 'normal',
					modifier: 'content',
					negate: false,
					subqueries: ['foo'],
				},
				{
					type: 'normal',
					modifier: 'tag',
					negate: false,
					subqueries: ['foo'],
				},
				{
					type: 'normal',
					modifier: 'title',
					negate: false,
					subqueries: ['foo'],
				},
			]
		},
	])

})

test('Query 10', () => {

	query = 'foo bar'
	queryParser.loadQuery(query)
	queryObjects = queryParser.getQueryObjects()
	expect(queryObjects).toStrictEqual([
		{
			type: 'any',
			modifier: '',
			negate: false,
			subqueries: [
				{
					type: 'normal',
					modifier: 'content',
					negate: false,
					subqueries: ['foo'],
				},
				{
					type: 'normal',
					modifier: 'tag',
					negate: false,
					subqueries: ['foo'],
				},
				{
					type: 'normal',
					modifier: 'title',
					negate: false,
					subqueries: ['foo'],
				},
			]
		},
		{
			type: 'any',
			modifier: '',
			negate: false,
			subqueries: [
				{
					type: 'normal',
					modifier: 'content',
					negate: false,
					subqueries: ['bar'],
				},
				{
					type: 'normal',
					modifier: 'tag',
					negate: false,
					subqueries: ['bar'],
				},
				{
					type: 'normal',
					modifier: 'title',
					negate: false,
					subqueries: ['bar'],
				},
			]
		},
	])

})

test('Query 20', () => {

	query = 'foo bar "hello world"'
	queryParser.loadQuery(query)
	queryObjects = queryParser.getQueryObjects()
	expect(queryObjects).toStrictEqual([
		{
			type: 'any',
			modifier: '',
			negate: false,
			subqueries: [
				{
					type: 'normal',
					modifier: 'content',
					negate: false,
					subqueries: ['foo'],
				},
				{
					type: 'normal',
					modifier: 'tag',
					negate: false,
					subqueries: ['foo'],
				},
				{
					type: 'normal',
					modifier: 'title',
					negate: false,
					subqueries: ['foo'],
				},
			]
		},
		{
			type: 'any',
			modifier: '',
			negate: false,
			subqueries: [
				{
					type: 'normal',
					modifier: 'content',
					negate: false,
					subqueries: ['bar'],
				},
				{
					type: 'normal',
					modifier: 'tag',
					negate: false,
					subqueries: ['bar'],
				},
				{
					type: 'normal',
					modifier: 'title',
					negate: false,
					subqueries: ['bar'],
				},
			]
		},
		{
			type: 'any',
			modifier: '',
			negate: false,
			subqueries: [
				{
					type: 'normal',
					modifier: 'content',
					negate: false,
					subqueries: ['\"hello world\"'],
				},
				{
					type: 'normal',
					modifier: 'tag',
					negate: false,
					subqueries: ['\"hello world\"'],
				},
				{
					type: 'normal',
					modifier: 'title',
					negate: false,
					subqueries: ['\"hello world\"'],
				},
			]
		},
	])

})

test('Query 30', () => {

	query = 'tag:foo bar title:wizz'
	queryParser.loadQuery(query)
	queryObjects = queryParser.getQueryObjects()
	expect(queryObjects).toStrictEqual([
		{
			type: 'normal',
			modifier: 'tag',
			negate: false,
			subqueries: ['foo', 'bar'],
		},
		{
			type: 'normal',
			modifier: 'title',
			negate: false,
			subqueries: ['wizz'],
		},
	])

})

test('Query 40', () => {

	query = 'tag:foo bar, title:wizz'
	queryParser.loadQuery(query)
	queryObjects = queryParser.getQueryObjects()
	expect(queryObjects).toStrictEqual([
		{
			type: 'normal',
			modifier: 'tag',
			negate: false,
			subqueries: ['foo', 'bar'],
		},
		{
			type: 'normal',
			modifier: 'title',
			negate: false,
			subqueries: ['wizz'],
		},
	])

})

test('Query 50', () => {

	query = 'tag:foo bar, -title:wizz'
	queryParser.loadQuery(query)
	queryObjects = queryParser.getQueryObjects()
	expect(queryObjects).toStrictEqual([
		{
			type: 'normal',
			modifier: 'tag',
			negate: false,
			subqueries: ['foo', 'bar'],
		},
		{
			type: 'normal',
			modifier: 'title',
			negate: true,
			subqueries: ['wizz'],
		},
	])

})

test('Query 60', () => {

	query = 'tag:foo bar, -hello title:wizz'
	queryParser.loadQuery(query)
	queryObjects = queryParser.getQueryObjects()
	expect(queryObjects).toStrictEqual([
		{
			type: 'normal',
			modifier: 'tag',
			negate: false,
			subqueries: ['foo', 'bar'],
		},
		{
			type: 'any',
			modifier: '',
			negate: true,
			subqueries: [
				{
					type: 'normal',
					modifier: 'content',
					negate: false,
					subqueries: ['hello'],
				},
				{
					type: 'normal',
					modifier: 'tag',
					negate: false,
					subqueries: ['hello'],
				},
				{
					type: 'normal',
					modifier: 'title',
					negate: false,
					subqueries: ['hello'],
				},
			],
		},
		{
			type: 'normal',
			modifier: 'title',
			negate: false,
			subqueries: ['wizz'],
		},
	])

})

test('Query 65', () => {

	query = 'tag:foo bar, alice -bob eve title:wizz'
	queryParser.loadQuery(query)
	queryObjects = queryParser.getQueryObjects()
	expect(queryObjects).toStrictEqual([
		{
			type: 'normal',
			modifier: 'tag',
			negate: false,
			subqueries: ['foo', 'bar'],
		},
		{
			type: 'any',
			modifier: '',
			negate: false,
			subqueries: [
				{
					type: 'normal',
					modifier: 'content',
					negate: false,
					subqueries: ['alice'],
				},
				{
					type: 'normal',
					modifier: 'tag',
					negate: false,
					subqueries: ['alice'],
				},
				{
					type: 'normal',
					modifier: 'title',
					negate: false,
					subqueries: ['alice'],
				},
			],
		},
		{
			type: 'any',
			modifier: '',
			negate: true,
			subqueries: [
				{
					type: 'normal',
					modifier: 'content',
					negate: false,
					subqueries: ['bob'],
				},
				{
					type: 'normal',
					modifier: 'tag',
					negate: false,
					subqueries: ['bob'],
				},
				{
					type: 'normal',
					modifier: 'title',
					negate: false,
					subqueries: ['bob'],
				},
			],
		},
		{
			type: 'any',
			modifier: '',
			negate: false,
			subqueries: [
				{
					type: 'normal',
					modifier: 'content',
					negate: false,
					subqueries: ['eve'],
				},
				{
					type: 'normal',
					modifier: 'tag',
					negate: false,
					subqueries: ['eve'],
				},
				{
					type: 'normal',
					modifier: 'title',
					negate: false,
					subqueries: ['eve'],
				},
			],
		},
		{
			type: 'normal',
			modifier: 'title',
			negate: false,
			subqueries: ['wizz'],
		},
	])

})

test('Query 68', () => {

	query = 'any: alice bob eve'
	queryParser.loadQuery(query)
	queryObjects = queryParser.getQueryObjects()
	expect(queryObjects).toStrictEqual([
		{
			type: 'any',
			modifier: '',
			negate: false,
			subqueries: [
				{
					type: 'any',
					modifier: 'content',
					negate: false,
					subqueries: ['alice', 'bob', 'eve'],
				},
				{
					type: 'any',
					modifier: 'tag',
					negate: false,
					subqueries: ['alice', 'bob', 'eve'],
				},
				{
					type: 'any',
					modifier: 'title',
					negate: false,
					subqueries: ['alice', 'bob', 'eve'],
				},
			],
		},
	])

})

test('Query 70', () => {

	query = 'any: alice bob eve tag:foo bar'
	queryParser.loadQuery(query)
	queryObjects = queryParser.getQueryObjects()
	expect(queryObjects).toStrictEqual([
		{
			type: 'any',
			modifier: '',
			negate: false,
			subqueries: [
				{
					type: 'any',
					modifier: 'content',
					negate: false,
					subqueries: ['alice', 'bob', 'eve'],
				},
				{
					type: 'any',
					modifier: 'tag',
					negate: false,
					subqueries: ['alice', 'bob', 'eve'],
				},
				{
					type: 'any',
					modifier: 'title',
					negate: false,
					subqueries: ['alice', 'bob', 'eve'],
				},
				{
					type: 'any',
					modifier: 'tag',
					negate: false,
					subqueries: ['foo', 'bar'],
				},
			],
		},
	])

})

test('Query 80', () => {

	query = 'any:tag:foo bar, -hello title:wizz'
	queryParser.loadQuery(query)
	queryObjects = queryParser.getQueryObjects()
	expect(queryObjects).toStrictEqual([
		{
			type: 'any',
			modifier: '',
			negate: false,
			subqueries: [
				{
					type: 'any',
					modifier: 'tag',
					negate: false,
					subqueries: ['foo', 'bar'],
				},
			],
		},
		{
			type: 'any',
			modifier: '',
			negate: true,
			subqueries: [
				{
					type: 'normal',
					modifier: 'content',
					negate: false,
					subqueries: ['hello'],
				},
				{
					type: 'normal',
					modifier: 'tag',
					negate: false,
					subqueries: ['hello'],
				},
				{
					type: 'normal',
					modifier: 'title',
					negate: false,
					subqueries: ['hello'],
				},
			],
		},
		{
			type: 'normal',
			modifier: 'title',
			negate: false,
			subqueries: ['wizz'],
		},
	])

})

test('Query 85', () => {

	query = 'any:tag:foo bar, -hello world title:wizz'
	queryParser.loadQuery(query)
	queryObjects = queryParser.getQueryObjects()
	expect(queryObjects).toStrictEqual([
		{
			type: 'any',
			modifier: '',
			negate: false,
			subqueries: [
				{
					type: 'any',
					modifier: 'tag',
					negate: false,
					subqueries: ['foo', 'bar'],
				},
			],
		},
		{
			type: 'any',
			modifier: '',
			negate: true,
			subqueries: [
				{
					type: 'normal',
					modifier: 'content',
					negate: false,
					subqueries: ['hello'],
				},
				{
					type: 'normal',
					modifier: 'tag',
					negate: false,
					subqueries: ['hello'],
				},
				{
					type: 'normal',
					modifier: 'title',
					negate: false,
					subqueries: ['hello'],
				},
			],
		},
		{
			type: 'any',
			modifier: '',
			negate: false,
			subqueries: [
				{
					type: 'normal',
					modifier: 'content',
					negate: false,
					subqueries: ['world'],
				},
				{
					type: 'normal',
					modifier: 'tag',
					negate: false,
					subqueries: ['world'],
				},
				{
					type: 'normal',
					modifier: 'title',
					negate: false,
					subqueries: ['world'],
				},
			],
		},
		{
			type: 'normal',
			modifier: 'title',
			negate: false,
			subqueries: ['wizz'],
		},
	])

})

test('Query 90', () => {

	query = 'any:tag:foo bar, -hello world'
	queryParser.loadQuery(query)
	queryObjects = queryParser.getQueryObjects()
	expect(queryObjects).toStrictEqual([
		{
			type: 'any',
			modifier: '',
			negate: false,
			subqueries: [
				{
					type: 'any',
					modifier: 'tag',
					negate: false,
					subqueries: ['foo', 'bar'],
				},
			],
		},
		{
			type: 'any',
			modifier: '',
			negate: true,
			subqueries: [
				{
					type: 'normal',
					modifier: 'content',
					negate: false,
					subqueries: ['hello'],
				},
				{
					type: 'normal',
					modifier: 'tag',
					negate: false,
					subqueries: ['hello'],
				},
				{
					type: 'normal',
					modifier: 'title',
					negate: false,
					subqueries: ['hello'],
				},
			],
		},
		{
			type: 'any',
			modifier: '',
			negate: false,
			subqueries: [
				{
					type: 'normal',
					modifier: 'content',
					negate: false,
					subqueries: ['world'],
				},
				{
					type: 'normal',
					modifier: 'tag',
					negate: false,
					subqueries: ['world'],
				},
				{
					type: 'normal',
					modifier: 'title',
					negate: false,
					subqueries: ['world'],
				},
			],
		},
	])

})

test('Query 100', () => {

	query = 'any:wizz tag:foo bar title:bar, -hello world'
	queryParser.loadQuery(query)
	queryObjects = queryParser.getQueryObjects()
	expect(queryObjects).toStrictEqual([
		{
			type: 'any',
			modifier: '',
			negate: false,
			subqueries: [
				{
					type: 'any',
					modifier: 'content',
					negate: false,
					subqueries: ['wizz'],
				},
				{
					type: 'any',
					modifier: 'tag',
					negate: false,
					subqueries: ['wizz'],
				},
				{
					type: 'any',
					modifier: 'title',
					negate: false,
					subqueries: ['wizz'],
				},
				{
					type: 'any',
					modifier: 'tag',
					negate: false,
					subqueries: ['foo', 'bar'],
				},
				{
					type: 'any',
					modifier: 'title',
					negate: false,
					subqueries: ['bar'],
				},
			],
		},
		{
			type: 'any',
			modifier: '',
			negate: true,
			subqueries: [
				{
					type: 'normal',
					modifier: 'content',
					negate: false,
					subqueries: ['hello'],
				},
				{
					type: 'normal',
					modifier: 'tag',
					negate: false,
					subqueries: ['hello'],
				},
				{
					type: 'normal',
					modifier: 'title',
					negate: false,
					subqueries: ['hello'],
				},
			],
		},
		{
			type: 'any',
			modifier: '',
			negate: false,
			subqueries: [
				{
					type: 'normal',
					modifier: 'content',
					negate: false,
					subqueries: ['world'],
				},
				{
					type: 'normal',
					modifier: 'tag',
					negate: false,
					subqueries: ['world'],
				},
				{
					type: 'normal',
					modifier: 'title',
					negate: false,
					subqueries: ['world'],
				},
			],
		},
	])

})

test('Query 110', () => {

	query = 'any:tag:projecta projectb title:contract, -any:tag:draft obsolete'
	queryParser.loadQuery(query)
	queryObjects = queryParser.getQueryObjects()
	expect(queryObjects).toStrictEqual([
		{
			type: 'any',
			modifier: '',
			negate: false,
			subqueries: [
				{
					type: 'any',
					modifier: 'tag',
					negate: false,
					subqueries: ['projecta', 'projectb'],
				},
				{
					type: 'any',
					modifier: 'title',
					negate: false,
					subqueries: ['contract'],
				},
			],
		},
		{
			type: 'any',
			modifier: '',
			negate: true,
			subqueries: [
				{
					type: 'any',
					modifier: 'tag',
					negate: false,
					subqueries: ['draft', 'obsolete'],
				},
			],
		},
	])

})
