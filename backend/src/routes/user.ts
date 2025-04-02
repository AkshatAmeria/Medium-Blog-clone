import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import {sign,verify,decode} from 'hono/jwt';
import { signinInput, signupInput, createPostInput, updatePostInput } from "@akshat1201/medium-common-2"


export const userRouter = new Hono<{
    Bindings:{
        DATABASE_URL:string;
        JWT_SECRET:string
      }
}>();



userRouter.post('/signup', async(c) => {

    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
  
  
    const body = await c.req.json();
    const { success } = signupInput.safeParse(body);
    if(!success){
      c.status(400);
      return c.json({error:"invalid input"});
    }
    try {
  
  const user = await prisma.user.create({
    data:{
      email:body.email,
      password:body.password
    }
  })
  const jwt = await sign({id:user.id},c.env.JWT_SECRET);
  return c.json({jwt});    
    } catch (e) {
      return c.status(403);
    }
  
  })
  



  userRouter.post('/signin', async(c) => {
  
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
  
    const body = await c.req.json();
    const { success } = signinInput.safeParse(body);
    if(!success){
      c.status(400);
      return c.json({error:"invalid input"})
    }
  try {
    
  const user = await prisma.user.findUnique({
    where:{
      email:body.email,
      password:body.password
    }
  })
  
  if(!user) {
     c.status(403);
  return c.json("Unauthorised")
  }
  const jwt = sign({id:user.id},c.env.JWT_SECRET)
  
  return c.json(jwt)
  return c.json("Signed inn :)")
  
  } catch (e) {
    console.log(e);
    c.status(411);
    return c.text('Invalid')
  }
  
  })