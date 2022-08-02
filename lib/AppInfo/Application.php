<?php
/**
 * @author 2021 Cyrille Bollu <cyrille@bollu.be>
 * @license <TODO>
 */

namespace OCA\Files_AdvancedSearch\AppInfo;

use OCA\Files_AdvancedSearch\Search\FilesAdvancedSearchSearchProvider;
use OCP\AppFramework\App;
use OCP\AppFramework\Bootstrap\IBootContext;
use OCP\AppFramework\Bootstrap\IBootstrap;
use OCP\AppFramework\Bootstrap\IRegistrationContext;
use OCP\Util;
use Symfony\Component\EventDispatcher\EventDispatcher;

class Application extends App implements IBootstrap {

	const APP_ID = 'files_advancedsearch';

        public function __construct() {
                parent::__construct(self::APP_ID);
	}

	public function register(IRegistrationContext $context): void {
		$context->registerSearchProvider(FilesAdvancedSearchSearchProvider::class);
	}

	public function boot(IBootContext $context): void {
		$context->injectFn(function (EventDispatcher $eventDispatcher) use ($context) {
			$eventDispatcher->addListener(
				'OCA\Files::loadAdditionalScripts',
				function() {
					Util::addScript(Self::APP_ID, 'files_advancedsearch');  // adds js/files_advancedsearch.js
				}
			);
        	});
	}

}
