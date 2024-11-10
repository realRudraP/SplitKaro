# SplitKaro

![GitHub Release](https://img.shields.io/github/v/release/realRudraP/SplitKaro)
![GitHub License](https://img.shields.io/github/license/realRudraP/SplitKaro)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](http://makeapullrequest.com)
[![Deployment Status](https://img.shields.io/badge/deployed-cloudflare-F38020)](https://splitkaro.pages.dev)

> A lightweight expense splitting web app that makes group expense management hassle-free.

## 🌟 Overview

SplitKaro is a browser-based expense splitting application designed to simplify shared expense management among groups. Whether you're traveling with friends, sharing an apartment, or splitting dinner bills, SplitKaro helps you keep track of who owes what and simplifies the settlement process.

## ✨ Features

### Current Features (v0.4)
- Create, view, and edit trips
- Add expenses with flexible splitting options:
  - Equal split among participants
  - Custom amount split
  - Automatic distribution of additional charges (taxes, tips, etc.)
- View detailed transaction history for each trip
- Offline-first approach with local data storage
- Clean, intuitive user interface

### Upcoming Features
- **v0.5**
  - Detailed payment instructions (who pays whom)
  - Transaction editing and deletion
- **v1.0**
  - Smart debt simplification (one transaction per user pair)
  - Progressive Web App (PWA) support
- **v1.5**
  - Optional cloud storage integration
  - User authentication system
- **v2.0**
  - Advanced debt simplification algorithm (minimum total transactions)

## 🚀 Getting Started

### Prerequisites
- Any modern web browser
- Git (for cloning the repository)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/realRudraP/SplitKaro.git
```

2. Navigate to the project directory:
```bash
cd SplitKaro
```

3. Open `index.html` in your web browser to run the application locally

### Live Demo
Visit [https://splitkaro.pages.dev](https://splitkaro.pages.dev) to try out SplitKaro.

## 💻 Technical Details

### Built With
- HTML5
- Vanilla JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - For styling
- [IDB Wrapper](https://github.com/jakearchibald/idb) - For IndexedDB interactions

### Data Models

#### Transaction Structure
```javascript
{
    transactionID: uuidv4(),
    eventID: eventID,
    transacationName: transactionName,
    payerName: payerName,
    payerID: payerID,
    amount: float,
    payees: payeeAmounts,
    commonCharges: float,
    timestamp: Date.now()
}
```

#### Trip Structure
```javascript
{
    id: uuidv4(),
    name: tripName,
    date: tripDate,
    participants: participants,
    totalAmountSpent: 0
}
```

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute:

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Submit a Pull Request

All PRs will be reviewed and considered for merging into the main branch.

## 🌿 Branch Structure
Currently maintaining a single main branch. Future development will implement:
- `main` - Stable releases
- `development` - Active development and features

## 🙏 Acknowledgments

- [Tailwind CSS](https://tailwindcss.com/) for the excellent UI framework
- [IDB Wrapper](https://github.com/jakearchibald/idb) for making IndexedDB interactions smoother

## 📄 License

MIT License

Copyright (c) 2024 RudraP

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

*Made with ❤️ to solve real-world expense sharing hassles*