# @open-pioneer/layout-sidebar

This package provides a sidebar component. This sidebar consists of a main section (with menu entries) and a content section, which is show, when some of the menu entries are selected.

## Integration

Currently the sidebar will be positioned absolute in the provided container. The following properties are provided:

-   It could be set with boolean (`defaultExpanded`) for default expension.
-   An event `expandedChanged` is triggered when the main section is expanded/collapsed.
-   `sidebarWidthChanged` informs about the current width of the sidebar. So the wrapping component can react on this width.
-   the `items` defined the visible menu entries and their corrensponding content.

See this sample for integration:

```tsx
<div style={{ position: "relative" }}>
    <Sidebar
        defaultExpanded={isExpanded}
        expandedChanged={(expanded) => setExpanded(expanded)}
        sidebarWidthChanged={(width) => setSidebarWidth()}
        items={items}
    />
</div>
```

Example for an `items` array:

```tsx
const items: SidebarItem[] = [
    {
        id: "sandbox",
        icon: <SomeIcon />,
        label: "Sandbox",
        content: <div>Content goes here...</div>
    }
];
```
