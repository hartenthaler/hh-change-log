const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('resources/js/hh-change-log.js', 'utf8');

function createTable() {
    const gedcomContent = {
        childNodes: [
            {nodeType: 3, textContent: '0 @I1@ INDI\n1 BIRT\n'},
            {nodeType: 1, tagName: 'DEL', textContent: '2 PLAC Berlin'},
            {nodeType: 3, textContent: '\n'},
            {nodeType: 1, tagName: 'INS', textContent: '2 PLAC Hamburg'},
        ],
        replaceWith(details) {
            this.details = details;
        },
    };
    const unknownContent = {
        childNodes: [{nodeType: 1, tagName: 'INS', textContent: '1 _CUSTOM value'}],
        replaceWith(details) {
            this.details = details;
        },
    };
    const complexContent = {
        childNodes: [
            {nodeType: 1, tagName: 'INS', textContent: '1 NAME Alice /Example/'},
            {nodeType: 3, textContent: '\n'},
            {nodeType: 1, tagName: 'INS', textContent: '1 SEX F'},
        ],
        replaceWith(details) {
            this.details = details;
        },
    };
    return {
        classList: {remove() {}},
        dataset: {
            ajax: '/changes',
            gedcomDetailsLabel: 'GEDCOM details',
            gedcomExpanded: 'false',
            maximumNumber: '15',
            showRecord: 'false',
            showTree: 'false',
            showUser: 'true',
            statusLabels: JSON.stringify({accepted: 'accepted', pending: 'pending', rejected: 'rejected'}),
            summaryLabels: JSON.stringify({'BIRT:PLAC': 'Birth place', NAME: 'Name', SEX: 'Sex'}),
            summaryText: JSON.stringify({
                added: '{fact} added',
                changed: '{fact} changed',
                empty: 'Empty value',
                new: 'New value',
                old: 'Previous value',
                removed: '{fact} removed',
            }),
            xref: 'I1',
        },
        querySelectorAll() {
            return [gedcomContent, unknownContent, complexContent];
        },
        complexContent,
        gedcomContent,
        unknownContent,
    };
}

function createFilters() {
    const fields = Object.fromEntries(
        ['from', 'to', 'type', 'username', 'oldged', 'newged'].map((name) => [name, {value: ''}]),
    );
    const handlers = {};
    const resetHandlers = {};

    fields.from.value = '2026-01-01';

    return {
        addEventListener(type, handler) {
            handlers[type] = handler;
        },
        elements: {
            namedItem(name) {
                return fields[name];
            },
        },
        fields,
        handlers,
        querySelector(selector) {
            assert.equal(selector, '.hh-change-log-reset');

            return {
                addEventListener(type, handler) {
                    resetHandlers[type] = handler;
                },
            };
        },
        resetHandlers,
    };
}

function run(version) {
    const table = createTable();
    const filters = createFilters();
    const loadedUrls = [];
    let options;

    const dataTable = {
        ajax: {
            url(url) {
                return {
                    load() {
                        loadedUrls.push(url);
                    },
                };
            },
        },
    };

    const DataTable = function (element, suppliedOptions) {
        assert.equal(element, table);
        options = suppliedOptions;

        return dataTable;
    };
    DataTable.versionCheck = () => version === 2;

    const jQuery = function (element) {
        assert.equal(element, table);

        return {
            DataTable(suppliedOptions) {
                options = suppliedOptions;

                return dataTable;
            },
        };
    };
    jQuery.fn = {DataTable() {}};

    const window = {
        DataTable,
        addEventListener() {},
        jQuery: version === 1 ? jQuery : undefined,
    };
    const document = {
        baseURI: 'https://example.test/individual/I1',
        createElement(tagName) {
            return {
                children: [],
                dataset: {},
                append(...children) {
                    this.children.push(...children);
                },
                before(element) {
                    this.beforeElement = element;
                },
                setAttribute(name, value) {
                    this[name] = value;
                },
                tagName: tagName.toUpperCase(),
            };
        },
        querySelector(selector) {
            return selector === '.of-changes' ? table : filters;
        },
    };

    vm.runInNewContext(source, {document, URL, window});

    assert.ok(options, `DataTables ${version} was not initialized`);
    assert.equal(options.ajax.type, 'POST');
    assert.equal(new URL(options.ajax.url).searchParams.get('xref'), 'I1');
    assert.equal(new URL(options.ajax.url).searchParams.get('from'), '2026-01-01');

    const request = {length: 25, start: 10};
    const submittedRequest = options.ajax.data(request);
    assert.equal(submittedRequest, request);
    assert.equal(request.from, '2026-01-01');
    assert.equal(request.to, '');
    assert.equal(request.type, '');
    assert.equal(request.username, '');
    assert.equal(request.oldged, '');
    assert.equal(request.newged, '');
    assert.equal(request.xref, 'I1');
    assert.equal(request.length, 5);

    const response = {data: [1, 2, 3, 4, 5, 6], recordsFiltered: 50, recordsTotal: 60};
    assert.deepEqual(Array.from(options.ajax.dataSrc(response)), [1, 2, 3, 4, 5]);
    assert.equal(response.recordsFiltered, 15);
    assert.equal(response.recordsTotal, 15);

    const columnDefinition = (target) => options.columnDefs.find((definition) => definition.targets === target);
    assert.equal(columnDefinition(0).visible, false);
    assert.equal(columnDefinition(3).visible, false);
    assert.equal(columnDefinition(4).visible, true);
    assert.equal(columnDefinition(5).visible, true);
    assert.equal(columnDefinition(6).visible, false);

    const statusRenderer = columnDefinition(2).render;
    const statusIndicator = statusRenderer('pending', 'display');
    assert.match(statusIndicator, /hh-change-log-status--pending/);
    assert.match(statusIndicator, /aria-label="pending"/);
    assert.match(statusIndicator, /title="pending"/);
    assert.equal(statusRenderer('pending', 'sort'), 'pending');

    options.drawCallback();

    const humanSummary = table.gedcomContent.details.beforeElement;
    assert.equal(humanSummary.className, 'hh-change-log-summary');
    assert.equal(humanSummary.children[0].textContent, 'Birth place changed');
    assert.equal(humanSummary.children[1].textContent, 'Berlin');
    assert.equal(humanSummary.children[1].title, 'Previous value');
    assert.equal(humanSummary.children[2].textContent, '→');
    assert.equal(humanSummary.children[3].textContent, 'Hamburg');
    assert.equal(humanSummary.children[3].title, 'New value');
    assert.equal(table.gedcomContent.details.children[1], table.gedcomContent);
    assert.equal(table.unknownContent.details.beforeElement, undefined);
    assert.equal(table.unknownContent.details.children[1], table.unknownContent);
    assert.equal(table.complexContent.details.beforeElement, undefined);
    assert.equal(table.complexContent.details.children[1], table.complexContent);

    filters.fields.to.value = '2026-02-01';
    filters.fields.type.value = 'pending';
    filters.fields.username.value = 'manager';
    filters.fields.oldged.value = '1 NAME';
    filters.fields.newged.value = '1 BIRT';
    filters.handlers.submit({preventDefault() {}});

    const filteredUrl = new URL(loadedUrls.at(-1));
    assert.equal(filteredUrl.searchParams.get('from'), '2026-01-01');
    assert.equal(filteredUrl.searchParams.get('to'), '2026-02-01');
    assert.equal(filteredUrl.searchParams.get('type'), 'pending');
    assert.equal(filteredUrl.searchParams.get('username'), 'manager');
    assert.equal(filteredUrl.searchParams.get('oldged'), '1 NAME');
    assert.equal(filteredUrl.searchParams.get('newged'), '1 BIRT');
    assert.equal(filteredUrl.searchParams.get('xref'), 'I1');

    filters.resetHandlers.click();

    const resetUrl = new URL(loadedUrls.at(-1));
    assert.equal(resetUrl.searchParams.get('xref'), 'I1');
    assert.equal(resetUrl.searchParams.has('from'), false);
    assert.equal(resetUrl.searchParams.has('to'), false);
    assert.equal(resetUrl.searchParams.has('type'), false);
    assert.equal(resetUrl.searchParams.has('username'), false);
    assert.equal(resetUrl.searchParams.has('oldged'), false);
    assert.equal(resetUrl.searchParams.has('newged'), false);
}

run(1);
run(2);

console.log('DataTables 1/2 compatibility tests passed.');
