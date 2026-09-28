import { Router, type IRouter } from "express";
import healthRouter from "./health";
import agrimindRouter from "./agrimind";

const router: IRouter = Router();

router.use(healthRouter);
router.use(agrimindRouter);

export default router;
