# 🌳 **webtrees** module for Change Log (hh-change-log)

[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](http://www.gnu.org/licenses/gpl-3.0)

![webtrees major version](https://img.shields.io/badge/webtrees-v2.2.x-green)
[![Latest release](https://img.shields.io/github/v/release/hartenthaler/hh-change-log)](https://github.com/hartenthaler/hh-change-log/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/hartenthaler/hh-change-log/total)](https://github.com/hartenthaler/hh-change-log/releases)

This [webtrees](https://www.webtrees.net) custom module adds a **Changes** tab to the individual page.
It shows the change-log entries for the currently viewed individual in a read-only table.

The module was originally created by **Nigel Osborne** for the [Our Families](http://www.our-families.info) website.
Current responsibility and maintenance are handled by **Hermann Hartenthaler**.

<a name="Contents"></a>
## 📚 Contents

This Readme contains the following main sections

* [Purpose](#Purpose)
* [Scope](#Scope)
* [Main features](#Features)
* [Configuration](#Configuration)
* [Requirements](#Requirements)
* [Installation](#Installation)
* [Upgrade](#Upgrade)
* [Translation](#Translation)
* [Support](#Support)
* [Credits](#Credits)
* [License](#License)

<a name="Purpose"></a>
## 🎯 Purpose

The standard webtrees control panel contains a global **Changes log** for managers.
This module makes the same type of information available directly on an individual page, filtered to the person currently being viewed.

It helps managers review what GEDCOM data was changed for a specific individual without opening the full control-panel change log and manually filtering it.

<a name="Scope"></a>
## 🔎 Scope

The module adds one individual-page tab named **Changes**.
It does not create GEDCOM records and it does not store additional data in its own database table.

The tab reads the existing webtrees change-log data and shows only entries related to the selected individual.
The output is read-only.

The tab is available only to managers of the current family tree because the underlying webtrees change-log endpoint is protected by manager permissions.

<a name="Features"></a>
## 💡 Main features

The module supports

* an individual-page tab named **Changes**
* read-only display of change-log entries for the selected individual
* DataTables-based server-side table loading
* timestamp, status, record, GEDCOM data, user, and tree columns
* highlighted GEDCOM differences for inserted and deleted data
* reuse of webtrees' existing translated change-log labels

<a name="Configuration"></a>
## ⚙️ Configuration

There are no specific module settings.

<a name="Requirements"></a>
## 📌 Requirements

This module requires **webtrees** version 2.2 or later.
It has the same system requirements as [webtrees](https://github.com/fisharebest/webtrees#system-requirements).

The module depends on the existing webtrees pending-changes log functionality.

<a name="Installation"></a>
## 📥 Installation
Use [Custom Module Manager](https://github.com/Jefferson49/CustomModuleManager)
for an easy and convenient installation of **webtrees** custom modules.

**Manual installation**:

1. Make a database backup.
1. Download or copy the module folder.
1. Place the folder in the `webtrees/modules_v4` directory of your web server.
1. Rename the folder to `hh-change-log`.
1. Login to **webtrees** as administrator.
1. Go to <span class="pointer">Control Panel / Modules / Individual page / Tabs</span>.
1. Enable the module named **Changes**.

<a name="Upgrade"></a>
## ⬆️ Upgrade

To update the module, replace the `hh-change-log` files with the files from the latest release
or maintained source.


<a name="Translation"></a>
## 🌍 Translation

This module supports custom translations through gettext files in `resources/lang/*.po`.

The module-specific title and description can be translated there.
The table labels and change-log status texts are taken from webtrees' existing translations.

There are currently translations for

* German by [@Hartenthaler](https://github.com/Hartenthaler)
* Dutch by [@TheDutchJewel](https://github.com/TheDutchJewel)

<a name="Support"></a>
## ❓ Support

* <span style="font-weight: bold;">Forum: </span>General webtrees support can be found in the [webtrees forum](https://www.webtrees.net/).

<a name="Credits"></a>
## 🙏 Credits

This module was originally created by **Nigel Osborne** for the [Our Families](http://www.our-families.info) website.

The [original PDF documentation](docs/individual-changes-tab.pdf) stated that the Our Families modules were written primarily for Nigel Osborne's own use, were not officially released, but could be shared under the same GPL as webtrees itself.
It also stated that there was no guarantee of ongoing updates, maintenance, modifications, or support.

Current responsibility and maintenance are handled by **Hermann Hartenthaler**.

<a name="License"></a>
## 📄 License

This module uses GPL-3.0-or-later as a license.

* Copyright (C) 2023 Nigel Osborne and our-families.info.
* Maintained from 2026 by Hermann Hartenthaler.
* Derived from **webtrees** - Copyright webtrees development team.

This program is free software: you can redistribute it and/or modify it
under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.