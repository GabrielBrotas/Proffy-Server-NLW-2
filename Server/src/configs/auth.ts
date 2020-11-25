import passport from 'passport'
import passportJWT from 'passport-jwt'
import db from '../database/connection';
import jwtConfig from './jwt-config'

const ExtractJwt = passportJWT.ExtractJwt;
const Strategy = passportJWT.Strategy;

const params = {
    secretOrKey: jwtConfig.jwtSecret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
}

export default function() {
    const stragery = new Strategy(params, async function(payload, done) {
        const users = await db('users').where('id', payload)
        const user = users[0] || null
        
        if(user) {
            return done(null, {id: user.id})
        } else {
            return done(new Error("User not found"), null)
        }
    });
    passport.use(stragery);
    return {
        initialize: function() {
            return passport.initialize();
        },
        authenticate: function() {
            passport.authenticate('jwt', jwtConfig.jwtSession)
        }
    }
}