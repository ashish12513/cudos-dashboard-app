# Dashboard Filter Usage Guide

## Quick Start

The Dashboard now includes a fully functional **Filters & Controls** section at the top of the page with 5 powerful filter options.

## How to Use Filters

### 1. **Multi-Select Dropdowns**
Each filter dropdown supports selecting multiple options:

- **Payer Accounts**: Select one or more AWS payer accounts
- **Account Names**: Filter by environment (Production, Development, Staging, Testing)
- **Linked Account IDs**: Select specific linked accounts
- **Charge Type**: Filter by charge type (Usage, Tax, Support, Refund)
- **Regions**: Select AWS regions (us-east-1, us-west-2, eu-west-1, ap-south-1, ap-southeast-1)

### 2. **Selecting Multiple Options**
To select multiple options in any dropdown:

**On Windows/Linux:**
- Hold `Ctrl` and click on options to select/deselect them

**On Mac:**
- Hold `Cmd` and click on options to select/deselect them

### 3. **Active Filters Display**
Once you select filters, they appear as colored tags below the filter panel:
- **Payer Accounts**: Dark green tags (#1B7D3F)
- **Account Names**: Light green tags (#2BA84F)
- **Linked Account IDs**: Deep green tags (#155E31)
- **Charge Type**: Dark green tags (#1B7D3F)
- **Regions**: Light green tags (#2BA84F)

Each tag has an **✕** button to remove that specific filter without resetting all filters.

### 4. **Reset All Filters**
Click the **↻ Reset Filters** button to clear all active filters at once.
- The button is **disabled** (grayed out) when no filters are active
- The button is **enabled** (green) when at least one filter is active

## Example Workflows

### Scenario 1: View Production Environment Only
1. Click on **Account Names** dropdown
2. Hold Ctrl/Cmd and click **Production**
3. See all data filtered to Production environment only

### Scenario 2: Monitor Multiple Regions
1. Click on **Regions** dropdown
2. Hold Ctrl/Cmd and click:
   - us-east-1
   - ap-south-1
3. Dashboard updates to show data from both regions

### Scenario 3: Analyze Specific Accounts
1. Click on **Payer Accounts** dropdown
2. Hold Ctrl/Cmd and select multiple accounts
3. Click on **Charge Type** dropdown
4. Hold Ctrl/Cmd and select **Usage** and **Support**
5. View combined data for selected accounts and charge types

### Scenario 4: Clear Everything
1. Click **↻ Reset Filters** button
2. All filters are cleared
3. Dashboard shows all data again

## Visual Indicators

### Filter Panel
- **Background**: Light green gradient (`from-[#1B7D3F]/5 to-[#2BA84F]/5`)
- **Border**: Subtle green border (`border-[#1B7D3F]/20`)
- **Title**: "🔍 Filters & Controls" with icon

### Active Filter Tags
- **Color-coded** by filter type
- **Removable** with individual ✕ buttons
- **Separated** from filter dropdowns by a border line
- **Appear/disappear** smoothly

### Reset Button
- **Disabled State**: Gray background, disabled cursor
- **Enabled State**: Green gradient background, clickable
- **Hover State**: Darker green gradient on hover

## Dashboard Data Updates

The filters are currently **client-side only**, meaning:
- ✅ Instant feedback when selecting filters
- ✅ No API calls required for filtering
- ✅ Smooth, responsive experience
- ⚠️ Filters don't persist on page reload (optional enhancement)

## Future Enhancements

Planned improvements for filter functionality:
1. **URL Persistence**: Filters saved in URL query parameters
2. **Filter Presets**: Save and load common filter combinations
3. **Server-Side Filtering**: Apply filters at API level for large datasets
4. **Filter History**: Quick access to recently used filters
5. **Advanced Filters**: Date ranges, cost thresholds, etc.

## Troubleshooting

### Filters not working?
- Ensure you're using Ctrl (Windows/Linux) or Cmd (Mac) to multi-select
- Try clicking the **↻ Reset Filters** button and start fresh
- Refresh the page if filters seem stuck

### Can't see active filters?
- Scroll down slightly - active filter tags appear below the dropdown section
- Make sure at least one filter is selected

### Want to select all options?
- Currently, you must select each option individually
- Future enhancement will add "Select All" option

## Color Reference

| Filter Type | Color | Hex Code |
|-------------|-------|----------|
| Payer Accounts | Dark Green | #1B7D3F |
| Account Names | Light Green | #2BA84F |
| Linked Account IDs | Deep Green | #155E31 |
| Charge Type | Dark Green | #1B7D3F |
| Regions | Light Green | #2BA84F |

## Tips & Tricks

1. **Quick Filter**: Select one filter to focus on specific data
2. **Combined Filters**: Use multiple filters together for precise analysis
3. **Reset Often**: Use Reset button to explore different filter combinations
4. **Tag Removal**: Click ✕ on individual tags to remove one filter at a time
5. **Responsive**: Filters work on desktop, tablet, and mobile devices

---

**Last Updated**: March 14, 2026
**Theme**: Redington India Professional Green
**Status**: ✅ Fully Functional
