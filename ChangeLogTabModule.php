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
use Fisharebest\Localization\Translation;
use Fisharebest\Webtrees\I18N;
use Fisharebest\Webtrees\Individual;
use Fisharebest\Webtrees\Module\AbstractModule;
use Fisharebest\Webtrees\Module\ModuleCustomInterface;
use Fisharebest\Webtrees\Module\ModuleCustomTrait;
use Fisharebest\Webtrees\Module\ModuleTabInterface;
use Fisharebest\Webtrees\Module\ModuleTabTrait;
use Fisharebest\Webtrees\View;
use Psr\Http\Message\ResponseInterface;

/**
 * Change-log tab module.
 */
class ChangeLogTabModule extends AbstractModule implements ModuleTabInterface, ModuleCustomInterface
{
    use ModuleCustomTrait;
    use ModuleTabTrait;

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
        return '2.6.6.0';
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
     * @return ResponseInterface
     */
    public function getCssAction(): ResponseInterface
    {
        return response(
            file_get_contents($this->resourcesFolder() . 'css/hh-change-log.min.css'),
            200,
            ['content-type' => 'text/css']
        );
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

		return view(
			$this->name() . '::tab',
			[
				'individual'             => $individual,
				'tree'                   => $individual->tree(),
				'xref'                   => $individual->xref(),
				'hh_change_log_css'      => route('module', ['module' => $this->name(), 'action' => 'Css']),
			]);
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
