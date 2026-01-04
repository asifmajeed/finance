# Task: Spending Analysis & Charts

**Estimated Time**: Week 3, Part 2
**Dependencies**: week2-task3-balance-calculations.md (calculations), week3-task1-budget-management.md (budgets)
**Priority**: High (Core feature)

---

## Context

Create visual analytics and insights for user spending patterns using charts. Implement monthly trends, category breakdowns, income vs expense comparisons, and summary statistics to help users understand their finances.

### Tech Stack
- **Charts**: react-native-chart-kit
- **Calculations**: Reuse calculation service
- **UI**: React Native Paper
- **Testing**: Jest + React Native Testing Library

---

## Chart Requirements

### 1. Monthly Spending Trend (Line Chart)
- X-axis: Last 6 months
- Y-axis: Amount spent
- Two lines: Income (green) and Expenses (red)
- Touchable to see exact values

### 2. Category Breakdown (Pie/Donut Chart)
- Show top 5 spending categories
- Each slice colored by category color
- Show percentage and amount
- Tap to see category details

### 3. Income vs Expense (Bar Chart)
- Grouped bar chart
- Compare income vs expenses by month
- Color-coded (green for income, red for expenses)

### 4. Summary Cards
- This month's total spending
- Biggest expense category
- Budget adherence percentage
- Average daily spending

---

## Tasks

### 1. Install Chart Library
- [ ] Install `react-native-chart-kit`
- [ ] Install `react-native-svg` (peer dependency)
- [ ] Test basic chart rendering

### 2. Analysis Screen

Create `src/screens/AnalysisScreen.js`:

#### Screen Layout
- [ ] Summary cards section (scrollable horizontally)
- [ ] Date range filter (chips: Week, Month, 3 Months, 6 Months, Custom)
- [ ] Charts section (scrollable vertically)
  - Monthly trend chart
  - Category pie chart
  - Income vs expense bar chart
- [ ] Optional: "AI Insights" button (if API key configured)

### 3. Monthly Trend Chart

Create `src/components/charts/MonthlyTrendChart.js`:

```javascript
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

export const MonthlyTrendChart = ({ data }) => {
  const screenWidth = Dimensions.get('window').width;

  const chartData = {
    labels: data.map(d => d.month), // ['Jan', 'Feb', 'Mar', ...]
    datasets: [
      {
        data: data.map(d => d.income),
        color: () => '#1DD1A1', // green
        strokeWidth: 2
      },
      {
        data: data.map(d => d.expense),
        color: () => '#FF6B6B', // red
        strokeWidth: 2
      }
    ],
    legend: ['Income', 'Expenses']
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    }
  };

  return (
    <LineChart
      data={chartData}
      width={screenWidth - 32}
      height={220}
      chartConfig={chartConfig}
      bezier
      style={{ marginVertical: 8, borderRadius: 16 }}
    />
  );
};
```

### 4. Category Pie Chart

Create `src/components/charts/CategoryPieChart.js`:

```javascript
import { PieChart } from 'react-native-chart-kit';

export const CategoryPieChart = ({ data }) => {
  const screenWidth = Dimensions.get('window').width;

  // Transform data: [{ name: 'Food', total: 500, color: '#FF6B6B' }, ...]
  const chartData = data.map(category => ({
    name: category.name,
    population: category.total,
    color: category.color,
    legendFontColor: '#7F7F7F',
    legendFontSize: 12
  }));

  const chartConfig = {
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`
  };

  return (
    <PieChart
      data={chartData}
      width={screenWidth - 32}
      height={220}
      chartConfig={chartConfig}
      accessor="population"
      backgroundColor="transparent"
      paddingLeft="15"
      absolute // Show absolute values, not percentages
    />
  );
};
```

### 5. Income vs Expense Bar Chart

Create `src/components/charts/IncomeExpenseChart.js`:

```javascript
import { BarChart } from 'react-native-chart-kit';

export const IncomeExpenseChart = ({ data }) => {
  const screenWidth = Dimensions.get('window').width;

  const chartData = {
    labels: data.map(d => d.month),
    datasets: [
      {
        data: data.map(d => d.income),
        color: () => '#1DD1A1'
      },
      {
        data: data.map(d => d.expense),
        color: () => '#FF6B6B'
      }
    ],
    legend: ['Income', 'Expenses']
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`
  };

  return (
    <BarChart
      data={chartData}
      width={screenWidth - 32}
      height={220}
      chartConfig={chartConfig}
      style={{ marginVertical: 8, borderRadius: 16 }}
    />
  );
};
```

### 6. Summary Cards

Create `src/components/SummaryCards.js`:

```javascript
import { Card, Text } from 'react-native-paper';

export const SummaryCard = ({ title, value, icon, color }) => (
  <Card style={{ width: 150, marginHorizontal: 8 }}>
    <Card.Content>
      <Icon source={icon} size={24} color={color} />
      <Text variant="labelSmall">{title}</Text>
      <Text variant="headlineMedium" style={{ color }}>
        {value}
      </Text>
    </Card.Content>
  </Card>
);

export const SummaryCards = ({ period }) => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    const { start, end } = getDateRange(period);
    const totalSpent = await getSumByType('expense', start, end);
    const topCategory = await getTopCategory(start, end);
    const budgetAdherence = await getBudgetAdherence(start, end);
    const avgDaily = await getDailyAverage(start, end);

    setStats({
      totalSpent,
      topCategory,
      budgetAdherence,
      avgDaily
    });
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <SummaryCard
        title="Total Spent"
        value={`$${stats.totalSpent?.toFixed(2)}`}
        icon="cash"
        color="#FF6B6B"
      />
      <SummaryCard
        title="Top Category"
        value={stats.topCategory?.name}
        icon={stats.topCategory?.icon}
        color={stats.topCategory?.color}
      />
      <SummaryCard
        title="Budget Adherence"
        value={`${stats.budgetAdherence?.toFixed(0)}%`}
        icon="target"
        color={stats.budgetAdherence > 80 ? '#1DD1A1' : '#FF6B6B'}
      />
      <SummaryCard
        title="Avg Daily"
        value={`$${stats.avgDaily?.toFixed(2)}`}
        icon="calendar"
        color="#4ECDC4"
      />
    </ScrollView>
  );
};
```

### 7. Date Range Filter

Create `src/components/DateRangeFilter.js`:

- [ ] Chip buttons: This Week, This Month, Last 3 Months, Last 6 Months
- [ ] Custom date range picker (modal with start/end date)
- [ ] Active filter highlighted
- [ ] Update charts on filter change

```javascript
export const DateRangeFilter = ({ onFilterChange }) => {
  const [selectedFilter, setSelectedFilter] = useState('month');

  const filters = [
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: '3months', label: 'Last 3 Months' },
    { key: '6months', label: 'Last 6 Months' },
    { key: 'custom', label: 'Custom' }
  ];

  const handleFilterPress = (filterKey) => {
    setSelectedFilter(filterKey);
    const dateRange = getDateRange(filterKey);
    onFilterChange(dateRange);
  };

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {filters.map(filter => (
        <Chip
          key={filter.key}
          selected={selectedFilter === filter.key}
          onPress={() => handleFilterPress(filter.key)}
          style={{ margin: 4 }}
        >
          {filter.label}
        </Chip>
      ))}
    </View>
  );
};
```

### 8. Data Preparation Service

Create `src/services/chartDataService.js`:

- [ ] `getMonthlyTrendData(months)` - Prepare data for line chart
- [ ] `getCategoryBreakdownData(startDate, endDate, limit)` - Top N categories
- [ ] `getIncomeExpenseData(months)` - Prepare data for bar chart
- [ ] `getSummaryStats(startDate, endDate)` - Calculate all summary metrics

```javascript
export const getMonthlyTrendData = async (monthCount = 6) => {
  const monthlyData = await getMonthlyTotals(monthCount);

  return monthlyData.map(data => ({
    month: formatMonth(data.month), // '2026-01' => 'Jan'
    income: data.income,
    expense: data.expense,
    net: data.income - data.expense
  }));
};

export const getCategoryBreakdownData = async (startDate, endDate, limit = 5) => {
  const categorySums = await getCategorySums(startDate, endDate);

  // Get top N categories
  const topCategories = categorySums.slice(0, limit);

  // Calculate total for percentage
  const total = categorySums.reduce((sum, cat) => sum + cat.total, 0);

  return topCategories.map(cat => ({
    ...cat,
    percentage: (cat.total / total) * 100
  }));
};
```

### 9. Chart Loading States

- [ ] Show skeleton loaders while data loads
- [ ] Show empty state if no data
- [ ] Error state if data fetch fails

### 10. Chart Interactions

- [ ] Tap on chart to see exact values
- [ ] Tap on pie slice to navigate to category transactions
- [ ] Swipe between charts (optional)

---

## Deliverables

### Must Have
1. ✅ Monthly trend line chart working
2. ✅ Category pie chart showing top 5 categories
3. ✅ Income vs expense bar chart
4. ✅ Summary cards with key metrics
5. ✅ Date range filter working
6. ✅ Charts update when filter changes
7. ✅ Loading states for all charts
8. ✅ Responsive chart sizing

### Nice to Have
- Chart export/screenshot feature
- Trend arrows (up/down from last period)
- Comparison mode (this month vs last month)
- Anomaly detection highlights

---

## Testing Requirements

### Unit Tests

```javascript
// src/services/__tests__/chartDataService.test.js
import { getMonthlyTrendData, getCategoryBreakdownData } from '../chartDataService';

describe('Chart Data Service', () => {
  it('should prepare monthly trend data', async () => {
    const data = await getMonthlyTrendData(3);

    expect(data).toHaveLength(3);
    expect(data[0]).toEqual({
      month: expect.any(String),
      income: expect.any(Number),
      expense: expect.any(Number),
      net: expect.any(Number)
    });
  });

  it('should calculate category percentages', async () => {
    const data = await getCategoryBreakdownData('2026-01-01', '2026-01-31', 5);

    expect(data).toHaveLength(5);
    const totalPercentage = data.reduce((sum, cat) => sum + cat.percentage, 0);
    expect(totalPercentage).toBeCloseTo(100, 1);
  });

  it('should return empty array if no data', async () => {
    const data = await getMonthlyTrendData(3);
    expect(data).toEqual([]);
  });
});
```

### Component Tests

```javascript
// src/screens/__tests__/AnalysisScreen.test.js
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AnalysisScreen from '../AnalysisScreen';

describe('AnalysisScreen', () => {
  it('should render all chart sections', async () => {
    const { getByText } = render(<AnalysisScreen />);

    await waitFor(() => {
      expect(getByText(/monthly trend/i)).toBeDefined();
      expect(getByText(/category breakdown/i)).toBeDefined();
      expect(getByText(/income vs expense/i)).toBeDefined();
    });
  });

  it('should update charts when filter changes', async () => {
    const { getByText } = render(<AnalysisScreen />);

    fireEvent.press(getByText('Last 3 Months'));

    await waitFor(() => {
      // Charts should reload with new date range
      expect(getByText(/last 3 months/i)).toBeDefined();
    });
  });
});
```

---

## UI Design

### Analysis Screen Layout
```
┌─────────────────────────────┐
│ Analysis                     │
├─────────────────────────────┤
│ ┌─────┐┌─────┐┌─────┐┌────┐ │
│ │Total││Top  ││Budgt││Avg │ │
│ │$2.5k││Food ││ 85% ││$83 │ │
│ └─────┘└─────┘└─────┘└────┘ │
├─────────────────────────────┤
│ [Week][Month][3mo][6mo]      │
├─────────────────────────────┤
│ Monthly Spending Trend       │
│ ┌───────────────────────┐   │
│ │     /\      /\        │   │
│ │    /  \    /  \  /\   │   │
│ │   /    \  /    \/  \  │   │
│ │  /      \/          \ │   │
│ └───────────────────────┘   │
│ Jan Feb Mar Apr May Jun      │
├─────────────────────────────┤
│ Category Breakdown           │
│ ┌───────────────────────┐   │
│ │      ◯                │   │
│ │    ◯ │ ◯              │   │
│ │  ◯   │   ◯            │   │
│ │      │                │   │
│ └───────────────────────┘   │
│ Food(40%) Transport(25%)...  │
├─────────────────────────────┤
│ Income vs Expense            │
│ ┌───────────────────────┐   │
│ │ ▓▓ ░░ ▓▓ ░░ ▓▓ ░░     │   │
│ │ ▓▓ ░░ ▓▓ ░░ ▓▓ ░░     │   │
│ └───────────────────────┘   │
│ Jan  Feb  Mar  Apr  May      │
└─────────────────────────────┘
```

---

## Performance Considerations

### Chart Rendering
- Limit data points (max 12 months for line chart)
- Aggregate data if too many points
- Use React.memo for chart components
- Lazy load charts (render on scroll)

### Data Caching
- Cache chart data for 10 minutes
- Invalidate on transaction changes
- Preload next period data

### Image Optimization
- Use SVG for crisp charts at any size
- Reduce chart redraw frequency

---

## Error Handling

### No Data
- Show empty state: "No data for this period"
- Suggest adding transactions

### Data Fetch Errors
- Show error message
- Provide retry button
- Log errors for debugging

### Chart Render Errors
- Fallback to text summary
- Show error boundary

---

## Accessibility

### Chart Alternatives
- Provide text summary of chart data
- Screen reader descriptions
- High contrast mode support

---

## References

- react-native-chart-kit: https://github.com/indiespirit/react-native-chart-kit
- Chart Design Best Practices: https://chartio.com/learn/charts/

---

## Next Task

After completing this task, proceed to: **week3-task3-alerts-notifications.md**
