import express from "express";
import dotenv from "dotenv"
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { initDB } from "./config/database.js";
import customerRoutes from "./routes/customersRoute.js";
import shipmentRoutes from "./routes/shipmentsRoute.js"
import paymentRoutes from "./routes/paymentsRoute.js";
import orderRoutes from "./routes/ordersRoute.js";
import categoryRoutes from "./routes/categoriesRoutes.js";
import productRoutes from "./routes/productsRoutes.js";
import cartRoutes from "./routes/cartsRoutes.js";
import orderItemsRoutes from "./routes/orderItemsRoutes.js";
import wishListRoutes from "./routes/wishListRoutes.js";
import shippingAddressRouter from './routes/shippingAddressRoute.js';
import walletRoutes from './routes/walletRoutes.js';
import bankAccountRoutes from './routes/bankAccountRoutes.js';
import walletTransactionRoutes from './routes/walletTransactionRoutes.js'
import orderStatusRoutes from './routes/orderStatusRoutes.js'
import chatRoute from './routes/chatRoutes.js'
import assistantRoutes from './routes/assistantRoutes.js'
// import rateLimiter from "./middleware/rateLimiter.js";
import imageSearchRoutes from "./routes/imageSearchRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);


// Create Socket.io instance
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

global.io = io;

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join room by on conversation_id (client emit 'join_conversation' với conversation_id)
  socket.on("join_conversation", (conversation_id) => {
    socket.join(`conversation_${conversation_id}`);
    console.log(`User ${socket.id} joined conversation ${conversation_id}`);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Middleware
// app.use(rateLimiter)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));
app.use(express.json());

const PORT = process.env.PORT;

app.get("/", (req, res) => {
    res.send("It's working")
})

app.get("/api", (req, res) => {
  res.send("It's working")
})

app.use("/api/customers", customerRoutes);
app.use("/api/shipment", shipmentRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order_item", orderItemsRoutes);
app.use("/api/wish_list", wishListRoutes);
app.use("/api/shipping_addresses", shippingAddressRouter);
app.use('/api/wallets', walletRoutes);
app.use('/api/bank_accounts', bankAccountRoutes);
app.use('/api/wallet_transaction', walletTransactionRoutes);
app.use('/api/order_status', orderStatusRoutes);
app.use('/api/chat', chatRoute);
app.use('/api/assistant', assistantRoutes);
app.use("/api/image-search", imageSearchRoutes);


// Initialize database with retry logic
initDB().catch((error) => {
    console.error("Error initializing DB", error);
    console.log("Server will start anyway. Please check your database connection.");
    console.log("You may need to:");
    console.log("  1. Check your internet connection (for cloud)");
    console.log("  2. Verify DATABASE_URL or DATABASE_URL_LOCAL in .env file");
    console.log("  3. Ensure Neon database is active (free tier auto-pauses) or local DB is running (Docker)");
});

// Start server regardless of DB connection status
server.listen(PORT, () => {
    console.log("Server is up and running on PORT:", PORT);
    console.log(`API available at: http://localhost:${PORT}`);
});

// Adjust file to test workflow for backend part 4
