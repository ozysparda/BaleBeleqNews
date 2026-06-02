import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import articlesRouter from "./articles";
import categoriesRouter from "./categories";
import usersRouter from "./users";
import mediaRouter from "./media";
import settingsRouter from "./settings";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/articles", articlesRouter);
router.use("/categories", categoriesRouter);
router.use("/users", usersRouter);
router.use("/media", mediaRouter);
router.use("/settings", settingsRouter);
router.use("/stats", statsRouter);

export default router;
