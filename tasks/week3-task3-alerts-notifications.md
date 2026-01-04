# Task: Alerts & Notifications

**Estimated Time**: Week 3, Part 3
**Dependencies**: week3-task1-budget-management.md (budgets)
**Priority**: Medium (Enhancement)

---

## Context

Implement notification system for budget alerts and spending summaries. Notify users when they're approaching or exceeding budgets, and provide optional daily/weekly summary notifications.

### Tech Stack
- **Notifications**: react-native-push-notification or @notifee/react-native
- **Scheduling**: Background task scheduling
- **Database**: Use existing budget and transaction services
- **Testing**: Jest

---

## Notification Types

### 1. Budget Alerts
- **80% Warning**: "You've used 80% of your [Category] budget"
- **100% Exceeded**: "You've exceeded your [Category] budget by $X"
- **Approaching End**: "3 days left in your budget period - $X remaining"

### 2. Summary Notifications (Optional)
- **Daily Summary**: "Today's spending: $X across Y transactions"
- **Weekly Summary**: "This week: Income $X, Expenses $Y"
- **Monthly Summary**: "Month-end summary: You spent $X, saved $Y"

### 3. Transaction Alerts (Optional)
- **Large Transaction**: "Large expense detected: $X at [Merchant]"
- **Unusual Spending**: "You've spent more than usual today"

---

## Tasks

### 1. Install Notification Library
- [ ] Choose: @notifee/react-native (recommended) or react-native-push-notification
- [ ] Install and configure for both iOS and Android
- [ ] Request notification permissions

### 2. Notification Permission Management

Create `src/utils/notificationPermissions.js`:

```javascript
import notifee, { AuthorizationStatus } from '@notifee/react-native';

export const requestNotificationPermission = async () => {
  const settings = await notifee.requestPermission();

  return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
};

export const checkNotificationPermission = async () => {
  const settings = await notifee.getNotificationSettings();

  return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
};
```

### 3. Notification Service

Create `src/services/notificationService.js`:

#### Core Functions
- [ ] `showBudgetWarning(budget, progress)` - 80% warning
- [ ] `showBudgetExceeded(budget, amount)` - Budget exceeded
- [ ] `showDailySummary(stats)` - Daily spending summary
- [ ] `showWeeklySummary(stats)` - Weekly summary
- [ ] `cancelNotification(id)` - Cancel scheduled notification
- [ ] `cancelAllNotifications()` - Clear all

```javascript
import notifee from '@notifee/react-native';

export const showBudgetWarning = async (budget, progress) => {
  const channelId = await notifee.createChannel({
    id: 'budget-alerts',
    name: 'Budget Alerts',
    importance: 4 // High
  });

  await notifee.displayNotification({
    title: `${budget.category.name} Budget Alert`,
    body: `You've used ${progress.percentage.toFixed(0)}% of your budget ($${progress.spent.toFixed(2)} of $${budget.amount.toFixed(2)})`,
    android: {
      channelId,
      smallIcon: 'ic_notification',
      color: '#F7B731',
      pressAction: {
        id: 'default',
        launchActivity: 'default'
      }
    },
    ios: {
      sound: 'default'
    }
  });
};

export const showBudgetExceeded = async (budget, excessAmount) => {
  const channelId = await notifee.createChannel({
    id: 'budget-alerts',
    name: 'Budget Alerts',
    importance: 4
  });

  await notifee.displayNotification({
    title: `${budget.category.name} Budget Exceeded!`,
    body: `You're $${excessAmount.toFixed(2)} over your $${budget.amount.toFixed(2)} budget`,
    android: {
      channelId,
      smallIcon: 'ic_notification',
      color: '#FF6B6B',
      pressAction: {
        id: 'default'
      }
    }
  });
};

export const showDailySummary = async (stats) => {
  const channelId = await notifee.createChannel({
    id: 'summaries',
    name: 'Daily Summaries',
    importance: 3 // Default
  });

  await notifee.displayNotification({
    title: 'Daily Spending Summary',
    body: `Today: $${stats.totalSpent.toFixed(2)} across ${stats.transactionCount} transactions`,
    android: {
      channelId,
      smallIcon: 'ic_notification'
    }
  });
};
```

### 4. Budget Alert Logic

Create `src/services/budgetAlertService.js`:

- [ ] Check budget progress after each transaction
- [ ] Send warning at 80%, 90%, 100%
- [ ] Track which alerts were already sent (prevent spam)
- [ ] Store alert history in database

```javascript
export const checkBudgetAlerts = async (categoryId) => {
  const activeBudgets = await getActiveBudgets();
  const budget = activeBudgets.find(b => b.category_id === categoryId);

  if (!budget) return;

  const progress = await getBudgetProgress(budget.id);
  const alertHistory = await getAlertHistory(budget.id);

  // 80% warning
  if (progress.percentage >= 80 && !alertHistory.includes('80%')) {
    await showBudgetWarning(budget, progress);
    await saveAlertHistory(budget.id, '80%');
  }

  // 100% exceeded
  if (progress.percentage >= 100 && !alertHistory.includes('100%')) {
    const excessAmount = progress.spent - budget.amount;
    await showBudgetExceeded(budget, excessAmount);
    await saveAlertHistory(budget.id, '100%');
  }
};

// Alert history table (add to database schema)
// CREATE TABLE alert_history (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   budget_id INTEGER NOT NULL,
//   alert_type TEXT NOT NULL, -- '80%', '100%', etc.
//   created_at TEXT NOT NULL
// );
```

### 5. Scheduled Notifications

Create `src/services/notificationScheduler.js`:

- [ ] Schedule daily summary (8 PM every day)
- [ ] Schedule weekly summary (Sunday 8 PM)
- [ ] Cancel scheduled notifications when disabled in settings

```javascript
import notifee, { TriggerType, RepeatFrequency } from '@notifee/react-native';

export const scheduleDailySummary = async () => {
  const trigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: getNextDailyTriggerTime(), // 8 PM today or tomorrow
    repeatFrequency: RepeatFrequency.DAILY
  };

  await notifee.createTriggerNotification(
    {
      id: 'daily-summary',
      title: 'Daily Spending Summary',
      body: 'Tap to view your spending for today',
      android: {
        channelId: 'summaries'
      }
    },
    trigger
  );
};

export const scheduleWeeklySummary = async () => {
  const trigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: getNextWeeklyTriggerTime(), // Next Sunday 8 PM
    repeatFrequency: RepeatFrequency.WEEKLY
  };

  await notifee.createTriggerNotification(
    {
      id: 'weekly-summary',
      title: 'Weekly Spending Summary',
      body: 'Tap to view your weekly financial summary',
      android: {
        channelId: 'summaries'
      }
    },
    trigger
  );
};

export const cancelScheduledNotifications = async () => {
  await notifee.cancelNotification('daily-summary');
  await notifee.cancelNotification('weekly-summary');
};
```

### 6. Settings Integration

Update `src/screens/SettingsScreen.js`:

#### Notification Settings Section
- [ ] Enable/disable budget alerts (toggle)
- [ ] Enable/disable daily summary (toggle)
- [ ] Enable/disable weekly summary (toggle)
- [ ] Summary notification time picker (e.g., 8 PM)
- [ ] Test notification button

```javascript
const NotificationSettings = () => {
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [dailySummary, setDailySummary] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState(false);

  const handleBudgetAlertsToggle = async (value) => {
    setBudgetAlerts(value);
    await saveSetting('budget_alerts', value);
  };

  const handleDailySummaryToggle = async (value) => {
    setDailySummary(value);
    await saveSetting('daily_summary', value);

    if (value) {
      await scheduleDailySummary();
    } else {
      await notifee.cancelNotification('daily-summary');
    }
  };

  return (
    <List.Section>
      <List.Subheader>Notifications</List.Subheader>

      <List.Item
        title="Budget Alerts"
        description="Notify when approaching or exceeding budget"
        right={() => <Switch value={budgetAlerts} onValueChange={handleBudgetAlertsToggle} />}
      />

      <List.Item
        title="Daily Summary"
        description="Daily spending summary at 8 PM"
        right={() => <Switch value={dailySummary} onValueChange={handleDailySummaryToggle} />}
      />

      <List.Item
        title="Weekly Summary"
        description="Weekly summary every Sunday"
        right={() => <Switch value={weeklySummary} onValueChange={handleWeeklySummaryToggle} />}
      />

      <Button onPress={testNotification}>Send Test Notification</Button>
    </List.Section>
  );
};
```

### 7. Notification Actions

Handle notification taps:
- [ ] Budget alert tap → Navigate to budget detail screen
- [ ] Daily summary tap → Navigate to transactions for today
- [ ] Weekly summary tap → Navigate to analysis screen

```javascript
// In App.js or main navigation setup
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    // Handle notification press
    if (detail.notification?.id === 'daily-summary') {
      // Navigate to transactions screen with today's filter
    }
  }
});

notifee.onForegroundEvent(({ type, detail }) => {
  if (type === EventType.PRESS) {
    // Handle foreground notification press
  }
});
```

### 8. Onboarding for Notifications

Update onboarding flow:
- [ ] Explain notification benefits
- [ ] Request permission
- [ ] Allow user to customize notification preferences
- [ ] Skip option available

---

## Deliverables

### Must Have
1. ✅ Budget alerts at 80% and 100% working
2. ✅ Notification permissions properly requested
3. ✅ Settings to enable/disable each notification type
4. ✅ Notifications work on both iOS and Android
5. ✅ Tapping notification navigates to relevant screen
6. ✅ Alert history tracking (prevent duplicate alerts)

### Nice to Have
- Daily/weekly summary notifications
- Custom alert thresholds (e.g., 75%, 90%, 95%)
- Notification sound customization
- Quiet hours (don't notify between 10 PM - 8 AM)
- Large transaction alerts

---

## Testing Requirements

### Unit Tests

```javascript
// src/services/__tests__/budgetAlertService.test.js
import { checkBudgetAlerts } from '../budgetAlertService';
import * as notificationService from '../notificationService';

jest.mock('../notificationService');

describe('Budget Alert Service', () => {
  it('should send warning at 80%', async () => {
    // Mock budget at 80% usage
    await checkBudgetAlerts(1);

    expect(notificationService.showBudgetWarning).toHaveBeenCalled();
  });

  it('should send exceeded alert at 100%', async () => {
    // Mock budget at 105% usage
    await checkBudgetAlerts(1);

    expect(notificationService.showBudgetExceeded).toHaveBeenCalled();
  });

  it('should not send duplicate alerts', async () => {
    // Mock alert already sent
    await checkBudgetAlerts(1);

    expect(notificationService.showBudgetWarning).not.toHaveBeenCalled();
  });
});
```

### Integration Tests

```javascript
// src/__tests__/integration/notifications.test.js
describe('Notification Integration', () => {
  it('should show notification when budget exceeded', async () => {
    // Create budget: $100
    await createBudget({ category_id: 1, amount: 100 });

    // Add expenses totaling $105
    await createTransaction({ amount: 105, category_id: 1, type: 'expense' });

    // Check for notification
    const notifications = await notifee.getDisplayedNotifications();
    expect(notifications).toContainEqual(
      expect.objectContaining({
        title: expect.stringContaining('Budget Exceeded')
      })
    );
  });
});
```

---

## Platform-Specific Considerations

### Android
- Notification channels required (API 26+)
- Set importance level for each channel
- Custom icons and colors
- Support for grouped notifications

### iOS
- Request authorization before showing notifications
- Handle notification permissions gracefully
- Support for critical alerts (optional)
- Rich notifications with images (optional)

---

## Error Handling

### Permission Denied
- Store preference, don't repeatedly ask
- Show in-app alerts instead of push notifications
- Provide link to app settings to enable

### Notification Failure
- Log error for debugging
- Fallback to in-app badge/banner
- Retry once on failure

---

## Privacy & Best Practices

### User Control
- All notifications opt-in (disabled by default)
- Clear explanation of what each notification does
- Easy to disable in settings

### Frequency Limits
- Max 1 budget alert per day per category
- Don't send alerts for same threshold multiple times
- Respect quiet hours if implemented

### Data Privacy
- Notifications don't reveal sensitive amounts in preview
- Option to hide amounts from lock screen
- Clear notification data on app uninstall

---

## Performance Considerations

### Background Processing
- Use efficient queries for budget checks
- Batch check all budgets at once
- Limit notification checks to transaction creation (not every read)

### Battery Usage
- Don't schedule unnecessary background tasks
- Use system triggers where possible
- Coalesce multiple alerts

---

## References

- Notifee: https://notifee.app/
- React Native Push Notification: https://github.com/zo0r/react-native-push-notification
- Android Notification Channels: https://developer.android.com/develop/ui/views/notifications/channels

---

## Next Task

After completing this task, proceed to: **week4-task1-settings-api.md**
