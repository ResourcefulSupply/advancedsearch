<?php

declare(strict_types=1);

/**
 * @copyright 2020 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @author Nithin SR <nithinin2001@gmail.com>
 * @author Cyrille Bollu <cyrpub@bollu.be>
 * @author Christoph Wurst <christoph@winzerhof-wurst.at>
 * @author Joas Schilling <coding@schilljs.com>
 * @author John Molakvoæ (skjnldsv) <skjnldsv@protonmail.com>
 * @author Roeland Jago Douma <roeland@famdouma.nl>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

namespace OCA\Files_AdvancedSearch\Search;

use OCA\Files_AdvancedSearch\AppInfo\Application;
use OCA\Files_AdvancedSearch\Service\SearchService;
use OCA\Files_AdvancedSearch\Service\WikipediaArticle;
use OCP\IL10N;
use OCP\IUser;
use OCP\Search\IProvider;
use OCP\Search\ISearchQuery;
use OCP\Search\SearchResult;
use OCP\Search\SearchResultEntry;
use function array_map;
use function mb_strpos;
use function mb_substr;
use function strlen;

class FilesAdvancedSearchSearchProvider implements IProvider {

	/**
	 * @var IL10N
	 */
	private $l10n;

	/**
	 * @var SearchService
	 */
	private $searchService;

	public function __construct(IL10N $l10n, SearchService $searchService) {
		$this->l10n = $l10n;
		$this->searchService = $searchService;
	}

	public function getId(): string {
		return Application::APP_ID;
	}

	public function getName(): string {
		return $this->l10n->t('Files advanced search');
	}

	public function getOrder(string $route, array $routeParameters): int {
		return -100;
	}

	public function search(IUser $user, ISearchQuery $query): SearchResult {
		return SearchResult::complete(
			$this->getName(),
			[]
		);
		if (mb_strpos($query->getTerm(), "wiki ") !== 0) {
			return SearchResult::complete(
				$this->getName(),
				[]
			);
		}

		$term = mb_substr($query->getTerm(), strlen("wiki "));
		$offset = $query->getCursor();
		if ($offset !== null) {
			$offset = (int) $offset;
		}

		$result = $this->searchService->search(
			$term,
			$offset
		);

		return SearchResult::paginated(
			$this->getName(),
			array_map(function(WikipediaArticle $article) {
				return new SearchResultEntry(
					'',
					$article->getTitle(),
					$this->l10n->t('Find more on Wikipedia'),
					$article->getUrl(),
					'icon-info'
				);
			}, $result->getArticles()),
			$result->getOffset()
		);
	}
}