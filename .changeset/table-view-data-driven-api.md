---
'@matchalatte/ssp-ui': minor
---

TableView takes its columns and rows as data. This replaces the markup-only API and is a breaking change for every consumer.

```svelte
<TableView.Root aria-label="Team" selectionMode="multiple">
  <TableView.Header columns={COLUMNS} />
  <TableView.Body items={rows} getKey={(u) => u.id}>
    {#snippet row(user)}
      <TableView.Row textValue={user.name}>
        <TableView.Cell column="name">{user.name}</TableView.Cell>
      </TableView.Row>
    {/snippet}
  </TableView.Body>
</TableView.Root>
```

- **`<TableView.Column>` is gone.** Columns are objects on `<TableView.Header columns>`: `{ id, label, isRowHeader?, allowsSorting?, … }`. The same array drives the header cells, the `<colgroup>` and `aria-colindex`, so they can no longer disagree — declaring columns in one order and rendering `<th>`s in another used to put a column's declared width on a different physical column. Pass a `column` snippet to Header when the header cell needs more than the label.
- **Rows come from `items` + `getKey` + a `row` snippet.** Row order is the array order. A consumer-side re-sort no longer has to be observed in the DOM, which is what previously left arrow keys, range selection and `aria-rowindex` disagreeing with each other after a sort.
- **`<TableView.Cell column="…">` is required**, and cells may be written in any order or skipped. Dev builds warn on an id no column declares and on two cells claiming the same column in one row.
- **`<TableView.Row key>` and `<TableView.Row isDisabled>` are gone.** Keys come from `getKey`; disabled rows are listed in Root's `disabledKeys`, so the server and the browser agree on which rows are selectable.
- **`hideHeader` on Root** replaces hiding the header by omitting `<TableView.Header>`. A hidden header renders no column menu, resize handle, sort click target or select-all checkbox — those would be focus stops the user cannot see — while the column names stay in the accessibility tree.
- **Cell `textValue`** is now read. Cells in a rowheader column supply the row's accessible name and its typeahead text, and a row with several rowheader columns is named from all of them.
- The `TData` type parameter is gone; item data flows through `items`.
