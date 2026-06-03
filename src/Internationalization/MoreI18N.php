<?php

declare(strict_types=1);

namespace Hartenthaler\Webtrees\ChangeLog\Internationalization;

use Fisharebest\Webtrees\I18N;

/**
 * Reuse webtrees core translations without adding these strings to the module catalog.
 */
class MoreI18N
{
    public static function xlate(string $message, ...$args): string
    {
        return I18N::translate($message, ...$args);
    }
}
