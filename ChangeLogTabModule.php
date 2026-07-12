<?php

declare(strict_types=1);

namespace Hartenthaler\Webtrees\ChangeLog;

/*
 * webtrees change-log tab.
 *
 * Copyright (C) 2023 Nigel Osborne and our-families.info. All rights reserved.
 * Maintained from 2026 by Hermann Hartenthaler.
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation; either version 3 of the License, or (at your option) any later version.
 */

use Fisharebest\Webtrees\Auth;
use Fisharebest\Webtrees\FlashMessages;
use Fisharebest\Localization\Translation;
use Fisharebest\Webtrees\I18N;
use Fisharebest\Webtrees\Individual;
use Fisharebest\Webtrees\Module\AbstractModule;
use Fisharebest\Webtrees\Module\ModuleCustomInterface;
use Fisharebest\Webtrees\Module\ModuleCustomTrait;
use Fisharebest\Webtrees\Module\ModuleConfigInterface;
use Fisharebest\Webtrees\Module\ModuleConfigTrait;
use Fisharebest\Webtrees\Module\ModuleGlobalInterface;
use Fisharebest\Webtrees\Module\ModuleGlobalTrait;
use Fisharebest\Webtrees\Module\ModuleTabInterface;
use Fisharebest\Webtrees\Module\ModuleTabTrait;
use Fisharebest\Webtrees\View;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

/**
 * Change-log tab module.
 */
class ChangeLogTabModule extends AbstractModule implements ModuleTabInterface, ModuleCustomInterface, ModuleConfigInterface, ModuleGlobalInterface
{
    use ModuleConfigTrait;
    use ModuleCustomTrait;
    use ModuleGlobalTrait;
    use ModuleTabTrait;

    private const PREF_DATE_RANGE = 'date_range';
    private const PREF_MAXIMUM_NUMBER = 'maximum_number';
    private const PREF_GEDCOM_DETAILS = 'gedcom_details';
    private const PREF_SHOW_USER = 'show_user';
    private const PREF_SHOW_TREE = 'show_tree';

    /**
     * How should this module be identified in the control panel, etc.?
     *
     * @return string
     */
    public function title(): string
    {
        return /* I18N: Name of a module/tab on the individual page. */ I18N::translate('Changes');
    }

    /**
     * A sentence describing what this module does.
     *
     * @return string
     */
    public function description(): string
    {
        return I18N::translate('A tab showing recent GEDCOM data changes for an individual.');
    }

    /**
     * The person or organisation who created this module.
     *
     * @return string
     */
    public function customModuleAuthorName(): string
    {
        return 'Hermann Hartenthaler';
    }

    /**
     * The version of this module.
     *
     * @return string
     */
    public function customModuleVersion(): string
    {
        return '2.2.6.4';
    }

    /**
     * A URL that will provide the latest version of this module.
     *
     * @return string
     */
    public function customModuleLatestVersionUrl(): string
    {
        return 'https://raw.githubusercontent.com/Hartenthaler/hh-change-log/main/latest-version.txt';
    }

    /**
     * Where to get support for this module.  Perhaps a github respository?
     *
     * @return string
     */
    public function customModuleSupportUrl(): string
    {
        return 'https://github.com/Hartenthaler/hh-change-log/issues';
    }

    /**
     * Additional/updated translations.
     *
     * @param string $language
     *
     * @return array<string,string>
     */
    public function customTranslations(string $language): array
    {
        $languageFile = match ($language) {
            'de'    => 'de',
            'nl'    => 'nl',
            default => '',
        };

        if ($languageFile === '') {
            return [];
        }

        $languageFolder = $this->resourcesFolder() . 'lang' . DIRECTORY_SEPARATOR;
        $poFile = $languageFolder . $languageFile . '.po';
        $moFile = $languageFolder . $languageFile . '.mo';

        if (is_file($poFile)) {
            return (new Translation($poFile))->asArray();
        }

        if (is_file($moFile)) {
            return (new Translation($moFile))->asArray();
        }

        return [];
    }

    /**
     * The default position for this tab.  It can be changed in the control panel.
     *
     * @return int
     */
    public function defaultTabOrder(): int
    {
        return 20;
    }

    /**
     * Is this tab empty? If so, we don't always need to display it.
     *
     * @param Individual $individual
     *
     * @return bool
     */
    public function hasTabContent(Individual $individual): bool
    {
        return Auth::isManager($individual->tree());
    }

    /**
     * A greyed out tab has no actual content, but may perhaps have
     * options to create content.
     *
     * @param Individual $individual
     *
     * @return bool
     */
    public function isGrayedOut(Individual $individual): bool
    {
        return false;
    }

    /**
     * Where does this module store its resources
     *
     * @return string
     */
    public function resourcesFolder(): string
    {
        return __DIR__ . '/resources/';
    }

    /**
     * Add the module stylesheet to the page head.
     */
    public function headContent(): string
    {
        return '<link rel="stylesheet" href="' . e($this->assetUrl('css/hh-change-log.min.css')) . '">';
    }

	/**
	 * Bootstrap the module
	 */
	public function boot(): void
	{
		// Register a namespace for our views.
		View::registerNamespace($this->name(), $this->resourcesFolder() . 'views/');
	}

    /** {@inheritdoc} */
    public function getTabContent(Individual $individual): string
    {
        if (!Auth::isManager($individual->tree())) {
            return '';
        }

		$dateRange = $this->positiveIntegerPreference(self::PREF_DATE_RANGE);
		$maximumNumber = $this->positiveIntegerPreference(self::PREF_MAXIMUM_NUMBER);

		return view(
			$this->name() . '::tab',
			[
				'individual'             => $individual,
				'tree'                   => $individual->tree(),
				'xref'                   => $individual->xref(),
				'from'                   => $dateRange === null ? '' : date('Y-m-d', strtotime('-' . $dateRange . ' days')),
				'maximum_number'         => $maximumNumber,
				'gedcom_expanded'        => $this->getPreference(self::PREF_GEDCOM_DETAILS, 'expand') !== 'collapse',
				'show_user'              => $this->getPreference(self::PREF_SHOW_USER, 'hide') === 'show',
				'show_tree'              => $this->getPreference(self::PREF_SHOW_TREE, 'hide') === 'show',
			]);
    }

    public function getAdminAction(ServerRequestInterface $request): ResponseInterface
    {
        $this->layout = 'layouts/administration';

        return $this->viewResponse($this->name() . '::settings', [
            'title' => $this->title(),
            'date_range' => (string) ($this->positiveIntegerPreference(self::PREF_DATE_RANGE) ?? ''),
            'maximum_number' => (string) ($this->positiveIntegerPreference(self::PREF_MAXIMUM_NUMBER) ?? ''),
            'gedcom_details' => $this->getPreference(self::PREF_GEDCOM_DETAILS, 'expand') === 'collapse' ? 'collapse' : 'expand',
            'show_user' => $this->getPreference(self::PREF_SHOW_USER, 'hide') === 'show' ? 'show' : 'hide',
            'show_tree' => $this->getPreference(self::PREF_SHOW_TREE, 'hide') === 'show' ? 'show' : 'hide',
        ]);
    }

    public function postAdminAction(ServerRequestInterface $request): ResponseInterface
    {
        $params = (array) $request->getParsedBody();

        $this->setPreference(self::PREF_DATE_RANGE, $this->validatedPositiveInteger($params['date_range'] ?? ''));
        $this->setPreference(self::PREF_MAXIMUM_NUMBER, $this->validatedPositiveInteger($params['maximum_number'] ?? ''));
        $this->setPreference(self::PREF_GEDCOM_DETAILS, ($params['gedcom_details'] ?? '') === 'collapse' ? 'collapse' : 'expand');
        $this->setPreference(self::PREF_SHOW_USER, ($params['show_user'] ?? '') === 'show' ? 'show' : 'hide');
        $this->setPreference(self::PREF_SHOW_TREE, ($params['show_tree'] ?? '') === 'show' ? 'show' : 'hide');

        FlashMessages::addMessage(I18N::translate('The display settings have been updated.'), 'success');

        return redirect($this->getConfigLink());
    }

    private function positiveIntegerPreference(string $preference): ?int
    {
        $value = $this->validatedPositiveInteger($this->getPreference($preference, ''));

        return $value === '' ? null : (int) $value;
    }

    private function validatedPositiveInteger(mixed $value): string
    {
        $value = trim((string) $value);

        return ctype_digit($value) && (int) $value > 0 ? (string) (int) $value : '';
    }
	/**
	 *  Constructor.
	 */
	public function __construct()
	{
		// IMPORTANT - the constructor is called on *all* modules, even ones that are disabled.
		// It is also called before the webtrees framework is initialised, and so other components
		// will not yet exist.
	}


    /** {@inheritdoc} */
    public function canLoadAjax(): bool
    {
        return false;
    }

}
