# SplitKaro

![GitHub Release](https://img.shields.io/github/v/release/realRudraP/SplitKaro)
![License](https://img.shields.io/badge/license-MIT-yellow?style=flat)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](http://makeapullrequest.com)
[![Deployment Status](https://img.shields.io/badge/deployed-cloudflare-F38020)](https://splitkaro.pages.dev)

> A lightweight expense splitting web app that makes group expense management hassle-free.

## 🌟 Overview

SplitKaro is a browser-based expense splitting application designed to simplify shared expense management among groups. Whether you're traveling with friends, sharing an apartment, or splitting dinner bills, SplitKaro helps you keep track of who owes what.

Try it out at [splitkaro.pages.dev](https://splitkaro.pages.dev)

## ✨ Features

### Current Features (v0.5)
- **Trip Management**
  - Create and view trips
  - Add and manage participants
  - Track total expenses
- **Expense Handling**
  - Add expenses with flexible splitting options
  - Equal split among participants
  - Custom amount split
  - Additional charges distribution (taxes, tips)
- **Debt Tracking**
  - Automatic debt calculations between participants
  - Performance-optimized caching system
  - Individual transaction management
  - Transaction deletion capability
- **Data Management**
  - Offline-first with local storage
  - Detailed transaction history
  - Clean, simple interface

### Development Roadmap
- **v1.0**
  - Debt simplification (one transaction per user pair)
  - Complete transaction management (edit & delete)
  - Trip deletion functionality
  - Progressive Web App (PWA) support
  - Enhanced payment instructions
- **v1.5**
  - Cloud storage integration
  - User authentication
- **v2.0**
  - Improved debt optimization
  - Enhanced transaction pathfinding

## 💻 Technical Details

### Built With
- HTML5
- Vanilla JavaScript
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [IDB Wrapper](https://github.com/jakearchibald/idb) for IndexedDB interactions

### Data Architecture

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

### Debt Management System
SplitKaro implements an efficient debt tracking system that maintains individual debt records between participants. The system uses caching to optimize performance, updating debt calculations only when new transactions are detected. This approach provides quick access to debt information while minimizing computational overhead.

## 🤝 Contributing

Contributions are welcome! Whether you're interested in fixing bugs, adding features, or improving documentation, here's how you can help:

1. Share ideas through issues
2. Submit code improvements
3. Enhance documentation
4. Suggest new features

We're particularly interested in contributions toward planned features and new ideas that could enhance the user experience.

## 🌿 Branch Structure
Currently using a single main branch. Future development will implement:
- `main` - Stable releases
- `development` - Active development

## 🙏 Acknowledgments

- [Tailwind CSS](https://tailwindcss.com/) for the UI framework
- [IDB Wrapper](https://github.com/jakearchibald/idb) for IndexedDB interactions

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