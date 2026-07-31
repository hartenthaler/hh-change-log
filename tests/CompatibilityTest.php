<?php

declare(strict_types=1);

use Fisharebest\Webtrees\Module\AbstractModule;
use Fisharebest\Webtrees\Module\ModuleConfigInterface;
use Fisharebest\Webtrees\Module\ModuleCustomInterface;
use Fisharebest\Webtrees\Module\ModuleGlobalInterface;
use Fisharebest\Webtrees\Module\ModuleTabInterface;

$webtrees_root = getenv('WEBTREES_ROOT');

if (!is_string($webtrees_root) || $webtrees_root === '' || !is_file($webtrees_root . '/vendor/autoload.php')) {
    throw new RuntimeException('Set WEBTREES_ROOT to a webtrees source tree with installed dependencies.');
}

require $webtrees_root . '/vendor/autoload.php';
$module = require __DIR__ . '/../module.php';

if (!$module instanceof AbstractModule
    || !$module instanceof ModuleConfigInterface
    || !$module instanceof ModuleCustomInterface
    || !$module instanceof ModuleGlobalInterface
    || !$module instanceof ModuleTabInterface
) {
    throw new RuntimeException('The module does not implement the required webtrees module architecture.');
}

$translations = $module->customTranslations('de');

if (($translations['A tab showing recent GEDCOM data changes for an individual.'] ?? '') === ''
    || ($translations['Birth place'] ?? '') !== 'Geburtsort'
    || ($translations['Baptism event'] ?? '') !== 'Taufereignis'
    || ($translations['{fact} with substructure added'] ?? '') !== '{fact} mit Unterstruktur hinzugefügt'
    || ($translations['Person created'] ?? '') !== 'Person neu angelegt'
    || ($translations['{fact} changed'] ?? '') !== '{fact} geändert'
) {
    throw new RuntimeException('The German gettext catalog could not be loaded.');
}

$dutch_translations = $module->customTranslations('nl');

if (($dutch_translations['Show column'] ?? '') !== 'Kolom weergeven'
    || ($dutch_translations['Hide column'] ?? '') !== 'Kolom verbergen'
    || ($dutch_translations['Apply filters'] ?? '') !== 'Filters toepassen'
    || ($dutch_translations['Reset filters'] ?? '') !== 'Filters wissen'
) {
    throw new RuntimeException('The module-specific Dutch labels could not be loaded.');
}

$has_webtrees_23_loader = class_exists(\Fisharebest\Webtrees\I18N\Translation::class);
$has_webtrees_22_loader = class_exists(\Fisharebest\Localization\Translation::class);

if (!$has_webtrees_23_loader && !$has_webtrees_22_loader) {
    throw new RuntimeException('No supported gettext loader is available.');
}

$script = file_get_contents(__DIR__ . '/../resources/js/hh-change-log.js');
$tab_view = file_get_contents(__DIR__ . '/../resources/views/tab.phtml');
$module_source = file_get_contents(__DIR__ . '/../ChangeLogTabModule.php');

if (!is_string($script) || !is_string($tab_view) || !is_string($module_source)) {
    throw new RuntimeException('The DataTables compatibility bridge could not be loaded.');
}

$script = str_replace("\r\n", "\n", $script);

if (str_contains($script, '$(document)')
    || str_contains($script, 'row.cells[2]')
    || !str_contains($script, "type: supportsDataTables2 ? 'POST' : 'GET'")
    || !str_contains($script, 'data.xref = table.dataset.xref')
    || !str_contains($script, 'return data;')
    || !str_contains($script, 'render: renderStatus, targets: 2')
    || !str_contains($script, "{data: 5},\n                {data: 6},\n                {data: 4}")
    || !str_contains($script, "order: [[0, 'desc']]")
    || substr_count($script, 'orderable: false') !== 7
    || !str_contains($script, "const filterNames = ['from', 'to', 'type', 'username', 'oldged', 'newged']")
    || !str_contains($script, 'dataTable.ajax.url(ajaxUrl()).load()')
    || !str_contains($script, 'const createSummaries = (content) =>')
    || !str_contains($script, "data.order = [{column: 0, dir: 'desc'}]")
    || !str_contains($script, "line.level === 1 && line.tag === 'CHAN'")
    || !str_contains($script, 'const createSubstructureSummary = (line) =>')
    || !str_contains($script, 'recordLines.every((line) => line.change === \'new\')')
    || !str_contains($script, 'stateSave: false')
    || !str_contains($script, 'hh-change-log-status--')
    || !str_contains($tab_view, "['module' => \$module_name, 'action' => 'Data', 'tree' => \$tree->name(), 'xref' => \$xref]")
    || !str_contains($module_source, "\$order = [['column' => 0, 'dir' => 'desc']]")
    || !str_contains($module_source, '->withQueryParams($query)')
    || !str_contains($module_source, '->withParsedBody($body)')
) {
    throw new RuntimeException('The DataTables compatibility bridge is incomplete.');
}

echo $has_webtrees_23_loader
    ? "webtrees 2.3 compatibility tests passed.\n"
    : "webtrees 2.2 compatibility tests passed.\n";
