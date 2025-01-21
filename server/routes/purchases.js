import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { checkoutSession, getPurchases } from "../controllers/purchases.js";
import { restrictTo } from "../middlewares/restricting.js";

const router = express.Router();

router.get("/get-purchases", verifyToken, restrictTo("admin"), getPurchases);

router.post("/checkout-session", verifyToken, checkoutSession);

export const purchasesRoutes = router;
