import express from "express";
import xss from "xss-clean";
import helmet from "helmet";
import compression from "compression";
import rateLimiter from "express-rate-limit";
import cookieParser from "cookie-parser";
import cors from "cors";
import { configDotenv } from "dotenv";
import { errorHandling } from "./middlewares/errorHandling.js";
import { ApiError } from "./utils/apiError.js";
import { authRoutes } from "./routes/auth.js";
import sequelize from "./config/db.js";
import { courseRoutes } from "./routes/course.js";
import { modulesRoutes } from "./routes/module.js";
import { contentRoutes } from "./routes/content.js";
import { reviewRoutes } from "./routes/review.js";
import { cartRoutes } from "./routes/cart.js";
import { couponRoutes } from "./routes/coupon.js";
import { purchasesRoutes } from "./routes/purchases.js";
import { webhook } from "./controllers/purchases.js";
configDotenv();

const app = express();
const apiLimit = rateLimiter({
  max: 300,
  windowMs: 15 * 60 * 1000,
  message: "Too many requests from this IP, please try again after 15 minutes!",
});

const authLimit = rateLimiter({
  max: 20,
  windowMs: 15 * 60 * 1000,
  message:
    "Too many login attempts from this IP, please try again after 15 minutes!",
});

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.post("/webhook", express.raw({ type: "application/json" }), webhook);
app.use(express.json());
app.use(cookieParser());
app.use(compression());
app.use(xss());
app.use(helmet());
app.use("/api/auth", authLimit);
app.use("/api", apiLimit);

//                                 **ROUTES**

app.get("/", (req, res) => {
  res.send("<a href='/api/auth/google'>Authenticate with google</a>");
});



app.use("/api/auth", authRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/module", modulesRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/purchases", purchasesRoutes);

app.use("/favicon.ico", express.static("./favicon.ico"));

app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route : ${req.originalUrl}`, 400));
});

app.use(errorHandling);

app.listen(process.env.PORT, async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("✅ All models were synchronized successfully.");
    console.log(`🚀 Server running on PORT:${process.env.PORT}`);
  } catch (error) {
    console.error("❌ Unable to synchronize models:", error);
  }
});

process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection Errors : ${err.name} | ${err.message}`);
  process.exit(1);
});
