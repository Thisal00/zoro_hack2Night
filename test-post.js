fetch('http://localhost:3001/api/payees', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    accountNumber: "12345678",
    accountName: "Test",
    nickname: "Test",
    email: "test@example.com"
  })
}).then(res => res.json()).then(console.log).catch(console.error);
