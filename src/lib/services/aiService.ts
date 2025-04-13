export async function analyzeJournalEntries(entries: any[]) {
  try {
    if (!entries || entries.length === 0) {
      throw new Error('No journal entries to analyze');
    }
    
    console.log(`Analyzing ${entries.length} journal entries...`);
    
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ entries })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API response error:', errorData);
      throw new Error(`Failed to analyze journal entries: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error analyzing journal entries:', error);
    throw error;
  }
}