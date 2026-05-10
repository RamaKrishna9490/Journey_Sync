import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import tripsRouter from "./trips";
import stopsRouter from "./stops";
import stopActivitiesRouter from "./stopActivities";
import packingRouter from "./packing";
import notesRouter from "./notes";
import dashboardRouter from "./dashboard";
import citiesRouter from "./cities";
import publicRouter from "./public";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(tripsRouter);
router.use(stopsRouter);
router.use(stopActivitiesRouter);
router.use(packingRouter);
router.use(notesRouter);
router.use(dashboardRouter);
router.use(citiesRouter);
router.use(publicRouter);

export default router;
