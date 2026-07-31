(() => {
    const table = document.querySelector('.of-changes');

    if (table === null) {
        return;
    }

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
        let requestStart = 0;

        const options = {
            ajax: {
                url: table.dataset.ajax,
                type: 'POST',
                data: (data) => {
                    requestStart = Number(data.start ?? 0);
                    data.from = table.dataset.from;
                    data.xref = table.dataset.xref;

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

                    details.dataset.hhChangeLogDetails = '';
                    details.open = table.dataset.gedcomExpanded === 'true';
                    summary.textContent = table.dataset.gedcomDetailsLabel;
                    content.replaceWith(details);
                    details.append(summary, content);
                });
            },
            order: [[0, 'desc']],
            searching: false,
            serverSide: true,
        };

        if (supportsDataTables2) {
            new window.DataTable(table, options);
        } else {
            window.jQuery(table).DataTable(options);
        }

        table.classList.remove('d-none');

        return true;
    };

    if (!initialize()) {
        window.addEventListener('load', initialize, {once: true});
    }
})();
