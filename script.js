const currencies = {
    'USD': '🇺🇸',
    'SGD': '🇸🇬',
    'EUR': '🇪🇺',
    'GBP': '🇬🇧',
    'JPY': '🇯🇵',
    'CNY': '🇨🇳',
    'KGS': '🇰🇬',
    'RUB': '🇷🇺'
  };
  
  let rates = null;
  let cache = { timestamp: null, data: null };
  let fromCurrency = 'USD';
  let toCurrency = 'SGD';
  
  const $ = id => document.getElementById(id);
  
  function updateFlags() {
    $('from-flag').textContent = currencies[fromCurrency];
    $('to-flag').textContent = currencies[toCurrency];
  }
  
  function convert(amount, from, to) {
    if (!rates) return 0;
    if (from === to) return amount;
    const inUSD = from === 'USD' ? amount : amount / rates[from];
    return to === 'USD' ? inUSD : inUSD * rates[to];
  }
  
  function calculate() {
    if (!rates) return;
    
    const amount = parseFloat($('amount-input').value) || 0;
    const result = convert(amount, fromCurrency, toCurrency);
    $('result').textContent = result.toFixed(2);
    
    const rate = convert(1, fromCurrency, toCurrency);
    $('rate-text').textContent = `1 ${fromCurrency} = ${rate.toFixed(5)} ${toCurrency}`;
  }
  
  async function fetchRates() {
    $('loading').classList.remove('hidden');
    $('app').classList.add('hidden');
    $('error').classList.add('hidden');
  
    try {
      const now = Date.now();
      if (cache.data && cache.timestamp && now - cache.timestamp < 3600000) {
        rates = cache.data;
      } else {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const json = await res.json();
        rates = json.rates;
        cache = { timestamp: now, data: rates };
      }
      
      $('loading').classList.add('hidden');
      $('app').classList.remove('hidden');
      calculate();
    } catch (err) {
      $('loading').classList.add('hidden');
      $('app').classList.remove('hidden');
      $('error').textContent = 'Failed to load rates. Please check your connection.';
      $('error').classList.remove('hidden');
    }
  }
  
  $('from-select').addEventListener('change', e => {
    fromCurrency = e.target.value;
    updateFlags();
    calculate();
  });
  
  $('to-select').addEventListener('change', e => {
    toCurrency = e.target.value;
    updateFlags();
    calculate();
  });
  
  $('amount-input').addEventListener('input', calculate);
  
  $('swap-btn').addEventListener('click', () => {
    [fromCurrency, toCurrency] = [toCurrency, fromCurrency];
    $('from-select').value = fromCurrency;
    $('to-select').value = toCurrency;
    updateFlags();
    calculate();
  });
  
  $('to-select').value = 'SGD';
  updateFlags();
  fetchRates();