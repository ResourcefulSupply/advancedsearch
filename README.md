# What's files_advancedsearch
files_advancedsearch makes you able to search for files using advanced search criteria.

files_advancedsearch supports searching for files based on their title, tags, or content (if 
fulltext_search is enabled), and any combination of these.

files_advancedsearch limits its searches to the current folder and its subfolders.

# Using files_advancedsearch

## Simple usage
When enabled, searching for files using Nextcloud's unified search will also trigger an advanced search in
the current folder and its subfolder.

The following criteria are supported:

1. 'tag:foo': Searches for files tagged with the 'foo' tag;
2. 'title:bar': Searches for files having 'bar' in their name;
3. 'test' (no criteria): Searches for files having 'test' in their name or content, or being tagged with
the 'test' tag.

You can specify several search terms in a criteria. So, 'tag:foo bar' will search for files tagged with
both the 'foo' and 'bar' tag.

Search terms with spaces shall be enclosed within double-quotes ('"'). So, while 'title:hello world' will 
search for files having both 'hello' and 'world' in their name, 'title:"hello world"' will search for files
having "hello world" exactly in their name; The first search would match a file called 'hello cruel world.md'
while the second search wouldn't.

## Combining criteria
You can combine your criteria by separating them with a comma (',') or simply by starting a new criteria. In 
this case, the resulting files will be those that match all specified criteria.

Examples:

1. 'tag:chore title:groceries' will search for files tagged 'chore' and having groceries in their name. Note
that 'tag:chore, title:groceries' would return the exact same files;
2. 'tag:chore, groceries' will search for files tagged 'chore', and having either 'groceries' in their name
or in their content, or being tagged with 'groceries'. Note that 'groceries tag:chore' (or 'groceries, tag:chore)
would yield the exact same results.

### Combining criteria with an 'any:' criteria
By default, combining criteria returns a result that is the intersection of the files matching the various criteria
(ie: a file must match all criteria to be considered a match for the whole search). You can change this by using
the 'any:' criteria: In this case a file that matches any of the criteria will be considerd a match for the
search as a whole.

Examples:
1. 'any:title:foo bar tag:test' will search for all files having either 'foo' or 'bar' in their title, or being
tagged with the 'test' tag.

Note that, since a comma stops the scope of a criteria, you cannot use the comma within a 'any:' criteria (eg: 
'any:title:foo bar, test' will search for files having either 'foo' or 'bar' in their name, and either having
'test' in their name, or having 'test' in their content, or being tagged with the 'test' tag. It will not search
for files having either 'foo' or 'bar' in their name, or having 'test' in their name, or 'having 'test' in their
content, or being tagged 'test'). To workaround this limitation you must place your search terms without criteria
before your search terms with criteria (So, 'any:test title:foo bar' will solve the issue presented in the previous
parentheses)

## Excluding files
You can precede a search term or criteria with a minus sign ('-') to specify that the files must not match
the specified search term or criteria.

Examples:

1. 'title:hello -world' will search for files having 'hello' in their title but not 'world'
2. '-title:hello world' will search for files that don't have 'hello' neither 'world' in their name

Note that excluding files is about excluding files from a set of matching files: it cannot be the sole critera of a
search. So, example 2 here above isn't supported per se and must be combined with another search criteria, for 
example 'tag:projectA -title:hello world' would search for all files tagged 'projectA' that don't have the words
'hello' or 'world' in their name.

Note also that excluding a search term or crtieria within an 'any:' criteria is not allowed and doesn't make sense.

# Development

## Building files_advancedsearch
npm run build

## Tests
files_advancedsearch has some unit tests that you may run with the following command:

npm run test
