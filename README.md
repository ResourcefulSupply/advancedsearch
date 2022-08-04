# What's Advanced Search
Advanced Search allows you to search for files using advanced search criteria. This extends Nextcloud’s full text search capabilities (if fulltext_search is enabled) to direct file searches towards a file’s tag or title, use an OR modifier instead of the standard AND, exlcude certain words from search, and find an exact match of a string of words. 

# How to Use Advanced Search

The advanced search funtionality can be thought of as two types of searching: specifying WHERE to search, and specifying HOW to search. They can also be combined and used interchangeably. 

## 1. Specifying WHERE to search

1. `tag:` limits the search to the file's tag. Example: ‘tag:finance’ searches for files tagged with “finance”.
2. `title:` limits the search to the file's title. Example: ‘title:report finance’ searches for files whose titles contain the words “report” and “finance”.

These can be combined. Example: ‘tag:finance title:report finance’ searches for files tagged with "finance" AND whose titles contain the words "report" and "finance".

## 2. Specifying HOW to search

1. `any:` searches for files that match any of the search terms listed. For context, the traditional Nextcloud search uses an AND operator -- meaning that all words in the search must be found in a file. This function converts the search logic into an AND -- where a match from any of the words provided will show the file. 
   - Example 1: ‘any:legal contract’ will return all files containing either "legal" or "contract".
   - Example 2: ‘any:title:legal contract’ will return all files whose filenames contain either "legal" or "contract".

2. `-` (minus) searches files that do not contain the word immediately following the minus. This modifier must be used in tandem with at least one other search to prevent overwhelming the search with too many matches. Example: ‘project -complete’  searches for files that contain the word “project” but do not contain the word “complete”.

3. `“”` (quotations) are used to specify an exact match for a string of words. Example: ‘brave new world’ returns only results with those three words in that exact sequence.

## Stopping the Advanced Search

1. `,` (comma) is used to stop an active Advanced Search operation and proceed with Nextcloud’s standard full text search. Any words after a comma will not be included in the Advanced Search, unless a new one is activated. Example: ‘tag:projecta, contract’ searches for files tagged with “projecta”, and then stops the active Advanced Search operator, and performs a normal search for the word "contract" anywhere in the file.

Note also that excluding a search term or crtieria within an 'any:' criteria is not allowed and doesn't make sense.

# Development

## Building files_advancedsearch
npm run build

## Tests
files_advancedsearch has some unit tests that you may run with the following command:

npm run test
