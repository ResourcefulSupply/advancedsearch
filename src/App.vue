<!--
  - @copyright 2021 Cyrille Bollu <cyrpub@bollu.be>
  -
  - @author Cyrille Bollu <cyrpub@bollu.be>
  -
  - @license AGPL-3.0
  -
  - This code is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License, version 3,
  - as published by the Free Software Foundation.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License, version 3,
  - along with this program.  If not, see <http://www.gnu.org/licenses/>
  -
  -->

<template>
	<div>
		<h1
			id="result-title"
			v-show="$store.state.files.length > 0">
			{{ "Advanced search results for query: " + $store.state.query }}
		</h1>
		<table
			id="result-table"
			class="list-container"
			v-show="$store.state.files.length > 0">
				<th class="column-name">
					<a
						class="name sort columntitle"
						@click="updateSortMethod('name')">
						<span>
							Name
						</span>
						<span
							class="sort-indicator"
							:class="[
								sortMethod.startsWith('name') ? '' : 'hidden',
								sortMethod.endsWith('asc') ? 'icon-triangle-n' : 'icon-triangle-s'
							]">
						</span>
					</a>
				</th>
				<th class="column-size">
					<a
						class="name sort columntitle"
						@click="updateSortMethod('size')">
						<span>
							Size
						</span>
						<span
							class="sort-indicator"
							:class="[
								sortMethod.startsWith('size') ? '' : 'hidden',
								sortMethod.endsWith('asc') ? 'icon-triangle-n' : 'icon-triangle-s'
							]">
						</span>
				</th>
				<th class="column-mtime">
					<a
						class="name sort columntitle"
						@click="updateSortMethod('mtime')">
						<span>
							Modified
						</span>
						<span
							class="sort-indicator"
							:class="[
								sortMethod.startsWith('mtime') ? '' : 'hidden',
								sortMethod.endsWith('asc') ? 'icon-triangle-n' : 'icon-triangle-s'
							]">
						</span>
				</th>
			<tbody>
				<tr v-for="file in sortedFiles">
					<td class="filename">
						<a
							class="name"
							:href="'/remote.php/webdav' + $store.state.currentFolder + '/' + file.name"
							target="_blank" >
							<div class="thumbnail-wrapper">
								<div
									class="thumbnail"
									:style="getThumbnail(file.id)" />
							</div>
							<span class="nametext">
								{{ file.name }}
							</span>
						</a>
					</td>
					<td class="filesize">
						{{ getFileSize(file.size) }}
					</td>
					<td class="date">
						<span class="modified live-relative-timespan">
							{{ getLastModified(file.lastmodified) }}
						</span>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script>
import filesize from 'filesize'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import {translate as t, translatePlural as n} from '@nextcloud/l10n'
import { getLocale } from '@nextcloud/l10n'

export default {
	name: 'App',
	created() {
		dayjs.extend(relativeTime)
	},
	data() {
		return {
			sortMethod: 'name-asc'
		}
	},
	computed: {
		sortedFiles() {
			switch(this.sortMethod) {
				case 'name-asc':
					return this.$store.state.files.sort((a,b) => {
						return a.name.localeCompare(b.name, getLocale(), {
							sensitivity: 'base',
							ignorePunctuation: true,
						})
					})
				case 'name-desc':
					return this.$store.state.files.sort((a,b) => {
						return b.name.localeCompare(a.name, getLocale(), {
							sensitivity: 'base',
							ignorePunctuation: true,
						})
					})
				case 'size-asc':
					return this.$store.state.files.sort((a,b) => { return a.size > b.size })
				case 'size-desc':
					return this.$store.state.files.sort((a,b) => { return a.size < b.size })
				case 'mtime-asc':
					return this.$store.state.files.sort((a,b) => { return a.lastmodified > b.lastmodified })
				case 'mtime-desc':
					return this.$store.state.files.sort((a,b) => { return a.lastmodified < b.lastmodified })
				}
		}
	},
	methods: {
		getFileSize(size) {
			return filesize(size, {round: 0})
		},
		getLastModified(lastmodified) {
			return dayjs(lastmodified).fromNow() 
		},
		getThumbnail(fileId) {
			return {
				backgroundImage: `url("/index.php/core/preview?fileId=${fileId}")`
			}
		},
		updateSortMethod(field) {
			if (this.sortMethod.startsWith(field)) {
				this.sortMethod = this.sortMethod.endsWith('asc') ? field + '-desc' : field + '-asc'
			} else {
				this.sortMethod = field + '-asc'
			}
		},
	}
}

</script>

<style>
#result-table {
        margin-top: 20px;
        width: 100%;
}

#result-table .column-name,
#result-table .filename {
        width: 99999px;
        max-width: 99999px;
}

#result-title {
        font-size: x-large;
        margin: 10px;
}
</style>
