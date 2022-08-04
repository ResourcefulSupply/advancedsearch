# Advanced Search
Advanced Search allows you to search for files using advanced search criteria. This extends Nextcloud’s full text search capabilities (if fulltext_search is enabled) to direct file searches towards a file’s tag or title, use an OR modifier instead of the standard AND, exlcude certain words from search, and find an exact match of a string of words. 

# How to Use It

The advanced search funtionality can be thought of as two types of searching: specifying WHERE to search, and specifying HOW to search. They can also be combined and used interchangeably. 

## Specifying WHERE to search

1. `tag:` limits the search to the file's tag. Example: ‘tag:finance’ searches for files tagged with “finance”.
2. `title:` limits the search to the file's title. Example: ‘title:report finance’ searches for files whose titles contain the words “report” and “finance”.

These can be combined. Example: ‘tag:finance title:report finance’ searches for files tagged with "finance" AND whose titles contain the words "report" and "finance".

## Specifying HOW to search

3. `any:` searches for files that match any of the search terms listed. For context, the traditional Nextcloud search uses an AND operator -- meaning that all words in the search must be found in a file. This function converts the search logic into an AND -- where a match from any of the words provided will show the file. 
   - Example 1: ‘any:legal contract’ will return all files containing either "legal" or "contract".
   - Example 2: ‘any:title:legal contract’ will return all files whose filenames contain either "legal" or "contract".

4. `-` (minus) searches files that do not contain the word immediately following the minus. This modifier must be used in tandem with at least one other search to prevent overwhelming the search with too many matches. Example: ‘project -complete’  searches for files that contain the word “project” but do not contain the word “complete”.

5. `“”` (quotations) are used to specify an exact match for a string of words. Example: ‘brave new world’ returns only results with those three words in that exact sequence.

## Additional Guidance

**Stopping the Active Advanced Search Operator**  
  6. `,` (comma) is used to stop an active Advanced Search operation and proceed with Nextcloud’s standard full text search. Any words after a comma will not be included in the Advanced Search, unless a new one is activated. Example: ‘tag:projecta, contract’ searches for files tagged with “projecta”, and then stops the active Advanced Search operator, and performs a normal search for the word "contract" anywhere in the file.

**Tips When Combining Advanced Searches**
- **A new Advanced Search operator will end the previous one.** While a comma will end an active search operator, a new Advanced Search operator will also end an active one. Example: the search ‘tag:projecta title:contract’ does not need a comma after “projecta” because the 'title:' operator will end the preivous one. The exception to this rule is when using a search operator within an ‘any:’ search, since 'any:' is designed to combine searches together.
- **How to apply a full text search and a limited WHERE search operator within an ‘any:’ search.** All full text search words must go before the WHERE-based search operator if using an ‘any:’ search. A comma cannot be used in this scenario because it will also turn off the 'any:' function. Here's an example of how to use it: ‘any:legal title:contract’ is correct and will find all files that contain the word “legal” OR have “contract” in the title. Using a comma in this scenario (‘any: title:contract, legal’) will turn off the 'any:' search for the word “legal”, which brings it back to a traditional AND search. 

# Development

## Building files_advancedsearch
npm run build

## Tests
files_advancedsearch has some unit tests that you may run with the following command:

npm run test
