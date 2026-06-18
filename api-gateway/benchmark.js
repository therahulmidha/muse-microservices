const autocannon = require('autocannon');

const instance = autocannon({
  url: 'https://localhost', // Replace with your port
  connections: 50,
  duration: 60,
  workers: 4,
  requests: [
    // {
    //   method: 'GET',
    //   path: '/journal',
    //   headers: { 
    //     'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsImlhdCI6MTc3NjA1MDY0MiwiZXhwIjoxODA3NjA4MjQyfQ.1xaYnFH56wCQTd3axswHTvbWRyS4bcN0594Je9yEyWk'
    //  }
    // },
    {
      method: 'POST',
      path: '/auth/login',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(
        {
            "password": "JohnDoe",
            "email": "john3@example.com"
          }
      )
    }
  ]
}, (err, result) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Test complete!');
  }
});

// Track and print progress to the console
autocannon.track(instance, { renderProgressBar: true, renderStatusCodes: true });
