import { NextFunction, Request, Response } from "express";
import { JwtAdapter } from "../../config";
import { error } from "console";



export class AuthMiddleware{

    static validateJWT = async (req: Request, res: Response, next: NextFunction) => {
        
        const authorization = req.header('Authorization');
        if(!authorization) {
            res.status(401).json({error: "No token provided"});
            return;
        }
        if(!authorization.startsWith('Bearer ')){
            res.status(401).json({error: 'Invalid Bearer token'});
            return;
        }

        const token = authorization.split(' ').at(1) || '';

        try {
            const payload = await JwtAdapter.validateToken<{id:string}>(token);
            if(!payload){
                res.status(401).json({error: 'No token provided'});
                return;
            }

            // const user = await 

            (req as any).user = payload;
            next();
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Internal server error"})
        }
    }

}