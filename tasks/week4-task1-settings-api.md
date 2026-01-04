# Task: Settings & API Integration

**Estimated Time**: Week 4, Part 1
**Dependencies**: All previous tasks (complete app needed)
**Priority**: Medium (Enhancement)

---

## Context

Create a comprehensive settings screen and integrate optional LLM-based insights using user-provided API keys. This allows users to customize app preferences, manage API keys securely, and get AI-powered spending analysis.

### Tech Stack
- **Settings**: React Native Paper (List, Switch components)
- **Secure Storage**: react-native-keychain (for API keys)
- **API Calls**: fetch or axios
- **LLM APIs**: OpenAI, Anthropic, Google Gemini (user choice)
- **Testing**: Jest

---

## Settings Categories

### 1. API & Insights
- API key management (OpenAI, Anthropic, Gemini)
- Enable/disable AI insights
- Choose AI provider

### 2. Appearance
- Theme: Light, Dark, System
- Currency selection
- Date format
- Number format (1,000.00 vs 1.000,00)

### 3. Notifications
- Budget alerts (already in week3-task3)
- Daily summaries
- Weekly summaries

### 4. Data & Privacy
- Export data to CSV
- Clear all data (with confirmation)
- View privacy policy
- View terms of service

### 5. About
- App version
- Build number
- Credits
- Help & support link
- Rate app link

---

## Tasks

### 1. Install Dependencies
- [ ] Install `react-native-keychain` for secure API key storage
- [ ] Install `axios` for API calls (or use fetch)
- [ ] Install `react-native-share` for data export

### 2. Settings Screen Structure

Create `src/screens/SettingsScreen.js`:

```javascript
import { ScrollView } from 'react-native';
import { List, Switch, Divider } from 'react-native-paper';

export const SettingsScreen = () => {
  return (
    <ScrollView>
      <List.Section>
        <List.Subheader>API & Insights</List.Subheader>
        <List.Item
          title="AI Provider"
          description="Configure your AI insights provider"
          left={props => <List.Icon {...props} icon="robot" />}
          onPress={() => navigation.navigate('APISettings')}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Appearance</List.Subheader>
        <List.Item
          title="Theme"
          description={theme}
          left={props => <List.Icon {...props} icon="palette" />}
          onPress={() => navigation.navigate('ThemeSettings')}
        />
        <List.Item
          title="Currency"
          description={currency}
          left={props => <List.Icon {...props} icon="currency-usd" />}
          onPress={() => navigation.navigate('CurrencySettings')}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Data & Privacy</List.Subheader>
        <List.Item
          title="Export Data"
          description="Download your data as CSV"
          left={props => <List.Icon {...props} icon="download" />}
          onPress={handleExportData}
        />
        <List.Item
          title="Clear All Data"
          description="Delete all transactions and budgets"
          left={props => <List.Icon {...props} icon="delete" />}
          onPress={handleClearData}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>About</List.Subheader>
        <List.Item
          title="Version"
          description={`${version} (${buildNumber})`}
          left={props => <List.Icon {...props} icon="information" />}
        />
      </List.Section>
    </ScrollView>
  );
};
```

### 3. API Settings Screen

Create `src/screens/APISettingsScreen.js`:

#### Features
- [ ] Provider selection (OpenAI, Anthropic, Gemini)
- [ ] API key input (secure text input)
- [ ] Test connection button
- [ ] Save/clear API key
- [ ] Usage disclaimer

```javascript
export const APISettingsScreen = () => {
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [testing, setTesting] = useState(false);

  const providers = [
    { value: 'openai', label: 'OpenAI (GPT-4)', icon: 'openai' },
    { value: 'anthropic', label: 'Anthropic (Claude)', icon: 'robot' },
    { value: 'gemini', label: 'Google Gemini', icon: 'google' }
  ];

  const handleSaveApiKey = async () => {
    try {
      await saveApiKey(provider, apiKey);
      showToast('API key saved securely');
    } catch (error) {
      showToast('Failed to save API key');
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    const success = await testApiConnection(provider, apiKey);
    setTesting(false);

    if (success) {
      showToast('Connection successful!');
    } else {
      showToast('Connection failed. Check your API key.');
    }
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text variant="titleMedium">AI Insights Provider</Text>
      <Text variant="bodySmall">
        Your API key is stored securely on your device and used only for insights.
        We never store or transmit your key to our servers.
      </Text>

      <SegmentedButtons
        value={provider}
        onValueChange={setProvider}
        buttons={providers}
      />

      <TextInput
        label="API Key"
        value={apiKey}
        onChangeText={setApiKey}
        secureTextEntry
        mode="outlined"
      />

      <Button
        mode="outlined"
        onPress={handleTestConnection}
        loading={testing}
        disabled={!apiKey}
      >
        Test Connection
      </Button>

      <Button mode="contained" onPress={handleSaveApiKey} disabled={!apiKey}>
        Save API Key
      </Button>

      <Button mode="text" onPress={() => setApiKey('')}>
        Clear API Key
      </Button>
    </ScrollView>
  );
};
```

### 4. Secure API Key Storage

Create `src/utils/secureStorage.js`:

```javascript
import * as Keychain from 'react-native-keychain';

export const saveApiKey = async (provider, apiKey) => {
  try {
    await Keychain.setGenericPassword(
      `api_key_${provider}`,
      apiKey,
      { service: `finance_app_${provider}` }
    );
    return true;
  } catch (error) {
    console.error('Error saving API key:', error);
    return false;
  }
};

export const getApiKey = async (provider) => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: `finance_app_${provider}`
    });

    if (credentials) {
      return credentials.password;
    }
    return null;
  } catch (error) {
    console.error('Error retrieving API key:', error);
    return null;
  }
};

export const deleteApiKey = async (provider) => {
  try {
    await Keychain.resetGenericPassword({
      service: `finance_app_${provider}`
    });
    return true;
  } catch (error) {
    console.error('Error deleting API key:', error);
    return false;
  }
};
```

### 5. LLM Insights Service

Create `src/services/llmInsightsService.js`:

```javascript
import axios from 'axios';

const API_ENDPOINTS = {
  openai: 'https://api.openai.com/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
  gemini: 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent'
};

export const getSpendingInsights = async (provider, transactionData) => {
  const apiKey = await getApiKey(provider);

  if (!apiKey) {
    throw new Error('API key not configured');
  }

  const prompt = generateInsightsPrompt(transactionData);

  try {
    switch (provider) {
      case 'openai':
        return await getOpenAIInsights(apiKey, prompt);
      case 'anthropic':
        return await getAnthropicInsights(apiKey, prompt);
      case 'gemini':
        return await getGeminiInsights(apiKey, prompt);
      default:
        throw new Error('Unknown provider');
    }
  } catch (error) {
    console.error('Error getting insights:', error);
    throw error;
  }
};

const getOpenAIInsights = async (apiKey, prompt) => {
  const response = await axios.post(
    API_ENDPOINTS.openai,
    {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful financial advisor. Analyze spending patterns and provide actionable insights.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.choices[0].message.content;
};

const generateInsightsPrompt = (data) => {
  return `
Analyze my spending for the last month:

Total Income: $${data.income}
Total Expenses: $${data.expenses}

Top Categories:
${data.categories.map(c => `- ${c.name}: $${c.total}`).join('\n')}

Recent Transactions:
${data.recentTransactions.map(t => `- ${t.description}: $${t.amount}`).join('\n')}

Provide:
1. Key observations about spending patterns
2. Potential areas to save money
3. Budget recommendations
4. Any concerning trends

Keep the response concise (under 200 words).
  `;
};
```

### 6. AI Insights Screen

Create `src/screens/AIInsightsScreen.js`:

- [ ] "Generate Insights" button
- [ ] Loading state while calling API
- [ ] Display insights in readable format
- [ ] Refresh button
- [ ] Error handling (no API key, API error, etc.)

```javascript
export const AIInsightsScreen = () => {
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState('openai');

  const handleGenerateInsights = async () => {
    setLoading(true);

    try {
      const { start, end } = getDateRange('month');
      const transactionData = await getTransactionSummary(start, end);

      const result = await getSpendingInsights(provider, transactionData);
      setInsights(result);
    } catch (error) {
      if (error.message === 'API key not configured') {
        Alert.alert(
          'API Key Required',
          'Please configure your AI provider API key in Settings.',
          [{ text: 'Go to Settings', onPress: () => navigation.navigate('Settings') }]
        );
      } else {
        Alert.alert('Error', 'Failed to generate insights. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text variant="headlineSmall">AI-Powered Insights</Text>

      <Button
        mode="contained"
        onPress={handleGenerateInsights}
        loading={loading}
        disabled={loading}
      >
        Generate Insights
      </Button>

      {insights && (
        <Card style={{ marginTop: 16 }}>
          <Card.Content>
            <Text variant="bodyMedium">{insights}</Text>
          </Card.Content>
        </Card>
      )}

      <Text variant="bodySmall" style={{ marginTop: 16, color: '#666' }}>
        Note: Insights are generated using your configured AI provider.
        Your transaction data is sent to the provider's API but not stored by us.
      </Text>
    </ScrollView>
  );
};
```

### 7. Data Export

Create `src/utils/dataExport.js`:

```javascript
import Share from 'react-native-share';
import RNFS from 'react-native-fs';

export const exportTransactionsToCSV = async () => {
  try {
    const transactions = await getAllTransactions();

    // Generate CSV
    const header = 'Date,Description,Amount,Type,Category\n';
    const rows = transactions.map(t =>
      `${t.date},"${t.description}",${t.amount},${t.type},"${t.category?.name || 'Uncategorized'}"`
    ).join('\n');

    const csv = header + rows;

    // Save to file
    const path = `${RNFS.DocumentDirectoryPath}/transactions_${Date.now()}.csv`;
    await RNFS.writeFile(path, csv, 'utf8');

    // Share file
    await Share.open({
      url: `file://${path}`,
      type: 'text/csv',
      title: 'Export Transactions'
    });

    return true;
  } catch (error) {
    console.error('Error exporting data:', error);
    return false;
  }
};
```

### 8. Theme Management

Create `src/utils/themeManager.js`:

```javascript
import { useColorScheme } from 'react-native';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const useAppTheme = () => {
  const colorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system');

  const getTheme = () => {
    if (themeMode === 'system') {
      return colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;
    }
    return themeMode === 'dark' ? MD3DarkTheme : MD3LightTheme;
  };

  return { theme: getTheme(), themeMode, setThemeMode };
};
```

---

## Deliverables

### Must Have
1. ✅ Settings screen with all categories
2. ✅ API key management (save/retrieve securely)
3. ✅ LLM insights working with at least OpenAI
4. ✅ Theme selection (light/dark/system)
5. ✅ Currency selection
6. ✅ Data export to CSV
7. ✅ Clear all data functionality (with confirmation)

### Nice to Have
- Support for all three AI providers (OpenAI, Anthropic, Gemini)
- Advanced export options (PDF, date range filter)
- Import data from CSV
- App language selection

---

## Testing Requirements

### Unit Tests

```javascript
// src/services/__tests__/llmInsightsService.test.js
import { getSpendingInsights } from '../llmInsightsService';
import axios from 'axios';

jest.mock('axios');

describe('LLM Insights Service', () => {
  it('should call OpenAI API correctly', async () => {
    axios.post.mockResolvedValue({
      data: {
        choices: [{ message: { content: 'Test insights' } }]
      }
    });

    const result = await getSpendingInsights('openai', mockData);

    expect(result).toBe('Test insights');
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('openai'),
      expect.any(Object),
      expect.any(Object)
    );
  });

  it('should handle API errors gracefully', async () => {
    axios.post.mockRejectedValue(new Error('API error'));

    await expect(getSpendingInsights('openai', mockData)).rejects.toThrow();
  });
});
```

---

## Security Considerations

### API Keys
- Store in secure keychain (not AsyncStorage)
- Never log API keys
- Clear API key on logout (if implemented)
- Warn users about API costs

### Data Export
- Confirm before exporting sensitive data
- Warn about sharing exported files
- Option to password-protect exports (optional)

---

## Error Handling

### API Errors
- Network errors: Show retry option
- Invalid API key: Clear error message, link to provider docs
- Rate limits: Inform user to wait

### Export Errors
- Storage permission denied: Request permission
- Disk full: Show clear error
- File write errors: Retry once

---

## References

- OpenAI API: https://platform.openai.com/docs
- Anthropic API: https://docs.anthropic.com/
- Gemini API: https://ai.google.dev/docs
- react-native-keychain: https://github.com/oblador/react-native-keychain

---

## Next Task

After completing this task, proceed to: **week4-task2-testing-bugs.md**
