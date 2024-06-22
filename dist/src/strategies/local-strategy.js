import passport from "passport";
import { Strategy } from "passport-local";
import { db } from "../db/db.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import bcryptjs from "bcryptjs";
passport.serializeUser((user, done) => {
    console.log(user.email);
    done(null, user.user_id);
});
passport.deserializeUser(async (id, done) => {
    const parsedId = Number(id);
    console.log("In deserializeUser, Id is: ", id);
    try {
        const foundUser = (await db
            .select({
            user_id: users.user_id,
            surname: users.surname,
            lastname: users.lastname,
            email: users.email,
            phone: users.phone,
            address: users.address,
        })
            .from(users)
            .where(eq(users.user_id, parsedId)));
        done(null, foundUser[0]);
    }
    catch (err) {
        done(err, null);
    }
});
export default passport.use(new Strategy({ usernameField: "email" }, async (username, password, done) => {
    try {
        const foundUser = (await db
            .select({
            user_id: users.user_id,
            surname: users.surname,
            password: users.password,
            lastname: users.lastname,
            email: users.email,
            phone: users.phone,
            address: users.address,
        })
            .from(users)
            .where(eq(users.email, username)));
        if (!foundUser[0])
            throw new Error("Invalid credentials");
        const matchedPassword = await bcryptjs.compare(password, foundUser[0].password);
        if (!matchedPassword)
            throw new Error("Invalid credentials");
        done(null, foundUser[0]);
    }
    catch (err) {
        done(err, false);
    }
}));
