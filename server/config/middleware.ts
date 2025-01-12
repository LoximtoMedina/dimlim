// Dependencies
import path from "path";
import express from "express";
import favicon from "serve-favicon";
import session from "express-session";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import compression from "compression";
import passport from "passport";
import helmet from "helmet";
import { v4 as uuidv4 } from "uuid";

import chalk from "chalk";

import { app, launchArgs } from "../index";

try {
    app.disable("x-powered-by");
    app.set("trust proxy", 1);

    // Requests
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(compression());

    // Static content
    let avatarsPath = launchArgs.dev == "true" ? "../../data/avatars" : "../../../data/avatars";

    app.use(favicon(path.join(__dirname, "../../public/favicon.ico")));
    app.use("/assets/", express.static(path.join(__dirname, "../../src/assets")));
    app.use("/avatars/", express.static(path.join(__dirname, avatarsPath)));

    // Session and login
    app.use(
        session({
            secret: (process.env.SESSION_SECRET as string) || uuidv4(),
            resave: false,
            saveUninitialized: true,
            cookie: {
                secure: (process.env.COOKIE_SECURE as string) == "true",
                maxAge: parseInt(process.env.COOKIE_MAX_AGE as string) || 604800000,
            },
        })
    );
    app.use(passport.initialize());
    app.use(passport.session());

    // Security, which is disabled in development mode
    if (launchArgs.dev !== "true") {
        app.use(helmet.contentSecurityPolicy());
        app.use(helmet.crossOriginEmbedderPolicy({ policy: "require-corp" }));
        app.use(helmet.crossOriginOpenerPolicy({ policy: "same-origin" }));
        app.use(helmet.crossOriginResourcePolicy({ policy: "same-origin" }));
        app.use(
            helmet.dnsPrefetchControl({
                allow: false,
            })
        );
        app.use(
            helmet.expectCt({
                maxAge: 0,
            })
        );
        app.use(
            helmet.frameguard({
                action: "sameorigin",
            })
        );
        app.use(
            helmet.hsts({
                maxAge: 15552000,
                includeSubDomains: true,
            })
        );
        app.use(
            helmet.permittedCrossDomainPolicies({
                permittedPolicies: "none",
            })
        );
        app.use(
            helmet.referrerPolicy({
                policy: "no-referrer",
            })
        );
        app.use(helmet.ieNoOpen());
        app.use(helmet.hidePoweredBy());
        app.use(helmet.noSniff());
        app.use(helmet.originAgentCluster());
        app.use(helmet.xssFilter());
    }

    console.log(`${chalk.cyanBright("info ")} - Middleware loaded`);
} catch (err) {
    console.log(`${chalk.redBright("error")} - There was an error loading the middleware`);
    console.log(err);
}

export {};
