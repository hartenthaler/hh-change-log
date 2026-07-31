(() => {
    const table = document.querySelector('.of-changes');

    if (table === null) {
        return;
    }

    const filters = document.querySelector('.hh-change-log-filters');
    const filterNames = ['from', 'to', 'type', 'username', 'oldged', 'newged'];
    const filterValue = (name) => filters?.elements.namedItem(name)?.value.trim() ?? '';
    const summaryLabels = JSON.parse(table.dataset.summaryLabels ?? '{}');
    const summaryText = JSON.parse(table.dataset.summaryText ?? '{}');
    const ajaxUrl = () => {
        const url = new URL(table.dataset.ajax, document.baseURI);

        url.searchParams.set('xref', table.dataset.xref);

        filterNames.forEach((name) => {
            const value = filterValue(name);

            if (value === '') {
                url.searchParams.delete(name);
            } else {
                url.searchParams.set(name, value);
            }
        });

        return url.toString();
    };

    const parseGedcomLines = (content) => {
        const lines = [];
        let text = '';
        let change = null;

        const pushLine = () => {
            const match = text.match(/^(\d+)\s+([A-Z0-9_]+)(?:\s+(.*))?$/);

            lines.push(match === null ? {text, change} : {
                text,
                change,
                level: Number(match[1]),
                tag: match[2],
                value: match[3] ?? '',
            });
            text = '';
            change = null;
        };

        const append = (value, lineChange) => {
            const parts = value.split('\n');

            parts.forEach((part, index) => {
                text += part;

                if (part !== '' && lineChange !== null) {
                    change = change === null || change === lineChange ? lineChange : 'mixed';
                }

                if (index < parts.length - 1) {
                    pushLine();
                }
            });
        };

        Array.from(content.childNodes).forEach((node) => {
            const tag = node.nodeType === 1 ? node.tagName.toLowerCase() : '';
            const lineChange = tag === 'del' ? 'old' : tag === 'ins' ? 'new' : null;

            append(node.textContent, lineChange);
        });

        if (text !== '') {
            pushLine();
        }

        return lines;
    };

    const summaryLabel = (lines, index) => {
        const line = lines[index];

        if (line.level === undefined || line.tag === undefined) {
            return null;
        }

        for (let previous = index - 1; previous >= 0; previous -= 1) {
            const parent = lines[previous];

            if (parent.change === null && parent.level !== undefined && parent.level < line.level) {
                const path = `${parent.tag}:${line.tag}`;

                return summaryLabels[path] ?? summaryLabels[line.tag] ?? null;
            }
        }

        return summaryLabels[line.tag] ?? null;
    };

    const formatSummaryText = (pattern, label) => pattern.replace('{fact}', label);

    const createValue = (value, type) => {
        const element = document.createElement('span');

        element.className = `hh-change-log-summary__value hh-change-log-summary__value--${type}`;
        element.textContent = value === '' ? summaryText.empty : value;
        element.title = type === 'old' ? summaryText.old : summaryText.new;

        return element;
    };

    const createSummary = (content) => {
        const lines = parseGedcomLines(content);
        const changes = lines
            .map((line, index) => ({...line, index, label: summaryLabel(lines, index)}))
            .filter((line) => line.change === 'old' || line.change === 'new');

        if (changes.length === 0 || changes.length > 2 || changes.some((line) => line.label === null)) {
            return null;
        }

        const oldLine = changes.find((line) => line.change === 'old');
        const newLine = changes.find((line) => line.change === 'new');
        let pattern;
        let label;

        if (oldLine !== undefined && newLine !== undefined) {
            if (oldLine.tag !== newLine.tag || oldLine.level !== newLine.level || oldLine.label !== newLine.label || oldLine.value === newLine.value) {
                return null;
            }

            pattern = summaryText.changed;
            label = oldLine.label;
        } else if (newLine !== undefined && changes.length === 1) {
            pattern = summaryText.added;
            label = newLine.label;
        } else if (oldLine !== undefined && changes.length === 1) {
            pattern = summaryText.removed;
            label = oldLine.label;
        } else {
            return null;
        }

        const summary = document.createElement('div');
        const title = document.createElement('span');

        summary.className = 'hh-change-log-summary';
        title.className = 'hh-change-log-summary__title';
        title.textContent = formatSummaryText(pattern, label);
        summary.append(title);

        if (oldLine !== undefined) {
            summary.append(createValue(oldLine.value, 'old'));
        }

        if (oldLine !== undefined && newLine !== undefined) {
            const arrow = document.createElement('span');

            arrow.className = 'hh-change-log-summary__arrow';
            arrow.textContent = '→';
            arrow.setAttribute('aria-hidden', 'true');
            summary.append(arrow);
        }

        if (newLine !== undefined) {
            summary.append(createValue(newLine.value, 'new'));
        }

        return summary;
    };

    const initialize = () => {
        if (table.dataset.hhChangeLogInitialized !== undefined) {
            return true;
        }

        const supportsDataTables2 = typeof window.DataTable === 'function'
            && typeof window.DataTable.versionCheck === 'function'
            && window.DataTable.versionCheck('2');
        const supportsDataTables1 = window.jQuery !== undefined && typeof window.jQuery.fn.DataTable === 'function';

        if (!supportsDataTables2 && !supportsDataTables1) {
            return false;
        }

        table.dataset.hhChangeLogInitialized = '';

        const maximum = Number(table.dataset.maximumNumber);
        const statusLabels = JSON.parse(table.dataset.statusLabels ?? '{}');
        let dataTable;
        let requestStart = 0;

        const options = {
            ajax: {
                url: ajaxUrl(),
                type: 'POST',
                data: (data) => {
                    requestStart = Number(data.start ?? 0);
                    data.xref = table.dataset.xref;
                    filterNames.forEach((name) => {
                        data[name] = filterValue(name);
                    });

                    if (maximum > 0) {
                        const remaining = Math.max(0, maximum - requestStart);
                        data.length = Number(data.length) < 0 ? remaining : Math.min(Number(data.length), remaining);
                    }
                },
                dataSrc: (json) => {
                    if (maximum > 0 && json) {
                        json.data = json.data.slice(0, Math.max(0, maximum - requestStart));
                        json.recordsTotal = Math.min(Number(json.recordsTotal), maximum);
                        json.recordsFiltered = Math.min(Number(json.recordsFiltered), maximum);
                    }

                    return json.data;
                },
            },
            drawCallback: () => {
                table.querySelectorAll('.gedcom-data:not([data-hh-change-log-details])').forEach((content) => {
                    const details = document.createElement('details');
                    const summary = document.createElement('summary');
                    const humanSummary = createSummary(content);

                    details.dataset.hhChangeLogDetails = '';
                    details.open = table.dataset.gedcomExpanded === 'true';
                    summary.textContent = table.dataset.gedcomDetailsLabel;
                    content.replaceWith(details);
                    if (humanSummary !== null) {
                        details.before(humanSummary);
                    }
                    details.append(summary, content);
                });

                table.querySelectorAll('tbody tr').forEach((row) => {
                    const statusCell = row.cells[2];

                    if (statusCell === undefined || statusCell.dataset.hhChangeLogStatus !== undefined) {
                        return;
                    }

                    const label = statusCell.textContent.trim();
                    const status = Object.keys(statusLabels).find((key) => statusLabels[key] === label) ?? 'unknown';
                    const indicator = document.createElement('span');

                    statusCell.dataset.hhChangeLogStatus = '';
                    indicator.className = `hh-change-log-status hh-change-log-status--${status}`;
                    indicator.setAttribute('aria-label', label);
                    indicator.setAttribute('role', 'img');
                    indicator.title = label;
                    statusCell.replaceChildren(indicator);
                });
            },
            order: [[0, 'desc']],
            searching: false,
            serverSide: true,
        };

        if (supportsDataTables2) {
            dataTable = new window.DataTable(table, options);
        } else {
            dataTable = window.jQuery(table).DataTable(options);
        }

        filters?.addEventListener('submit', (event) => {
            event.preventDefault();
            dataTable.ajax.url(ajaxUrl()).load();
        });

        filters?.querySelector('.hh-change-log-reset')?.addEventListener('click', () => {
            filterNames.forEach((name) => {
                filters.elements.namedItem(name).value = '';
            });
            dataTable.ajax.url(ajaxUrl()).load();
        });

        table.classList.remove('d-none');

        return true;
    };

    if (!initialize()) {
        window.addEventListener('load', initialize, {once: true});
    }
})();
