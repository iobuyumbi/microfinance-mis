# Microfinance MIS

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) application for managing microfinance operations.

## Project Structure

```
microfinance-mis/
├── client/      # React front-end
├── server/      # Express.js back-end
└── README.md    # Project documentation
```

## Requirements

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- pnpm

## Getting Started

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd microfinance-mis
   ```
2. **Install dependencies:**
   - For the client:
     ```sh
     cd client
     pnpm install
     ```
   - For the server:
     ```sh
     cd ../server
     pnpm install
     ```
3. **Set up environment variables:**
   - Create a `.env` file in the `server/` directory with:
     ```env
     MONGO_URI=mongodb://localhost:27017/your-db-name
     PORT=5000
     NODE_ENV=development
     ```
4. **Run the application:**
   - Start the server:
     ```sh
     pnpm start
     # or for development with auto-reload:
     pnpm run dev
     ```
   - Start the client (in a separate terminal):
     ```sh
     cd ../client
     pnpm run dev
     ```

## Usage

- The backend API will be available at `http://localhost:5000/`.
- The frontend will be available at the port shown in your terminal (default: `http://localhost:5173/`).

## Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
