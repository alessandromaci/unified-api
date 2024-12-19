# Unified Staking API

The Unified Staking API is a streamlined solution for staking assets across multiple blockchains. This project provides a modular and extensible framework for interacting with blockchain staking systems, supporting a variety of networks such as **Polkadot**, **Solana**, **Polygon**, and more.

## Features

- Modular signing modules for multiple blockchains.
- Easy-to-use staking entry point (`stake.js`).
- Secure handling of sensitive data with `.env` support.
- Dynamic environment validation to prevent configuration issues.
- Clear, concise logging for debugging and transparency.

---

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/unified-staking-api.git
cd unified-staking-api
```


### 2. Install Dependencies
Ensure you have Node.js (stable version) and npm installed. Then, install project dependencies:

```bash
npm install
```

### 3. Configure Environment Variables
Copy the .env.example file to .env and fill in the required values:
```bash
SIGN_POLKADOT_PROVIDER=wss://your-polkadot-provider
SIGN_POLKADOT_SECRET_FILE_NAME=path/to/polkadot/secret.json
SIGN_POLKADOT_PASSWORD=your-password
SIGN_POLYGON_RPC_URL=https://your-polygon-rpc
SIGN_POLYGON_PRIVATE_KEY=your-private-key
```
Refer to the ```config.json``` for blockchain-specific configuration details.

### 4. Run the Staking Script
Use the stake.js script to interact with the staking API. Example:
```bash
node stake.js --network=<blockchain>
```
Replace <blockchain> with the supported blockchain name (e.g., polkadot, solana).

### Project Structure
- ```sign_modules```: Contains blockchain-specific signing logic (e.g., polkadot, solana).
- ```services```: Handles API interactions, transaction broadcasting, etc.
- ```utils```: Utility functions for environment validation, logging, etc.
- ```config.json```: Configurable parameters for blockchains and staking operations.
- ```.env```: Environment variables for sensitive data like private keys and RPC URLs.

### Supported Blockchains
- **Polkadot**
- **Solana**
- **Polygon**
- Additional blockchains can be added via the sign_modules folder.

### Testing
Run unit tests to ensure functionality:
```bash
npm test
```

### Contributing
We welcome contributions! Please open a pull request or file an issue for any feature requests or bugs.

### License
This project is licensed under the MIT License.